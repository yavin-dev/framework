import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import BardFactSerializer from 'navi-data/serializers/facts/bard';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import { AjaxError } from 'ember-ajax/errors';

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

  test('extractError - object', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'foo', parameters: {} }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };

    const payload = {
      description: 'Metric(s) "[foo]" do not exist.',
      druidQuery: {},
      reason: 'Bad request',
      requestId: '123',
      status: 400,
      statusName: 'Bad request'
    };
    const response = new AjaxError(payload, 'Timeout', 400);
    const error = Serializer.extractError(response, request);

    assert.deepEqual(
      error.errors,
      [
        {
          status: '400',
          detail: 'Metric(s) "[foo]" do not exist.',
          id: '123'
        }
      ],
      '`extractError` populates error object correctly when given a bard response object'
    );
  });

  test('extractError - timeout', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'metricName', parameters: { param: 'value' } }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };

    const payload = 'The adapter operation timed out';
    const response = new AjaxError(payload, 'Timeout', 408);

    const error = Serializer.extractError(response, request);
    assert.deepEqual(
      error.details,
      ['Data Timeout'],
      '`extractError` populates error object correctly when given a timeout error'
    );
  });

  test('extractError - rate limit', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'foo', parameters: {} }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };

    const payload = {
      description: 'Rate limit reached. reject https://foo.com/',
      druidQuery: {},
      reason: 'Too many requests',
      requestId: '123',
      status: 429,
      statusName: 'Too many requests'
    };
    const response = new AjaxError(payload, payload.reason, payload.status);
    const error = Serializer.extractError(response, request);

    assert.deepEqual(
      error.details,
      ['Rate limit reached, please try again later.'],
      '`extractError` populates error object correctly when given a rate limit error'
    );
  });

  test('extractError - error', function(assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'foo', parameters: {} }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0'
    };

    const response = new Error("Uncaught TypeError: Cannot read property 'foo' of null");
    const error = Serializer.extractError(response, request);

    assert.deepEqual(error.details, [], '`extractError` populates error object correctly when given a error response');
  });
});
