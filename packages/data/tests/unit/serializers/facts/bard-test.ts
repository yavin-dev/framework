import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import BardFactSerializer from 'navi-data/serializers/facts/bard';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';

let Serializer: BardFactSerializer;

module('Unit | Serializer | facts/bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Serializer = this.owner.lookup('serializer:facts/bard');
  });

  test('normalize - empty rows', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'metricName', parameters: { param: 'value' } }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };

    const response: ResponseV1 = {
      rows: [],
      meta: {
        pagination: {
          currentPage: 1,
          rowsPerPage: 0,
          perPage: 10,
          numberOfResults: 0
        }
      }
    };
    const { rows, meta } = Serializer.normalize(response, request) as NaviFactResponse;
    assert.deepEqual({ rows, meta }, response, 'Returns empty rows but preserves meta when there is no request');
  });

  test('normalize by request', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [
        { type: 'timeDimension', field: 'tableName.dateTime', parameters: { grain: 'day' } },
        { type: 'dimension', field: 'age', parameters: { field: 'id' } },
        { type: 'dimension', field: 'age', parameters: { field: 'key' } },
        { type: 'metric', field: 'metricName', parameters: {} },
        { type: 'metric', field: 'metricName', parameters: { param: 'value' } }
      ],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };
    const rawRows = [
      {
        dateTime: 'blah1',
        'age|id': 'blah2',
        'age|key': 'blah3',
        metricName: 'blah4',
        'metricName(param=value)': 'blah5'
      }
    ];

    const { rows, meta } = Serializer.normalize({ rows: rawRows, meta: {} }, request) as NaviFactResponse;

    assert.deepEqual(
      { rows, meta },
      {
        rows: [
          {
            'tableName.dateTime(grain=day)': 'blah1',
            'age(field=id)': 'blah2',
            'age(field=key)': 'blah3',
            metricName: 'blah4',
            'metricName(param=value)': 'blah5'
          }
        ],
        meta: {}
      },
      'The fili fields are mapped to the correct column canonical names'
    );
  });
});
