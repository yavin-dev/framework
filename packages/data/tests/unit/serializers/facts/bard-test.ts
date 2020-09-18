import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import BardFactSerializer from 'navi-data/serializers/facts/bard';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

let Serializer: BardFactSerializer;

module('Unit | Serializer | facts/bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Serializer = this.owner.lookup('serializer:facts/bard');
  });

  test('normalize', function(assert) {
    assert.expect(4);

    //@ts-expect-error
    assert.deepEqual(Serializer.normalize(), undefined, '`undefined` is returned for an undefined response');

    assert.deepEqual(
      //@ts-expect-error
      Serializer.normalize({ foo: 'bar' }),
      {
        rows: [],
        meta: {}
      },
      'Returns `undefined` with invalid payload and undefined request'
    );

    assert.deepEqual(
      //@ts-expect-error
      Serializer.normalize({ rows: 'bar' }),
      {
        rows: [],
        meta: {}
      },
      'Returns `undefined` with payload and undefined request'
    );

    assert.deepEqual(
      //@ts-expect-error
      Serializer.normalize({ rows: 'bar', meta: { next: 'nextLink' } }),
      {
        rows: [],
        //@ts-expect-error
        meta: { next: 'nextLink' }
      },
      'Returns empty rows but preserves meta when there is no request'
    );
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
    const rows = [
      {
        dateTime: 'blah1',
        'age|id': 'blah2',
        'age|key': 'blah3',
        metricName: 'blah4',
        'metricName(param=value)': 'blah5'
      }
    ];

    assert.deepEqual(
      Serializer.normalize({ rows, meta: {} }, request),
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
