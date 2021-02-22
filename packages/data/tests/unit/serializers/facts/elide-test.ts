import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import NaviFactSerializer from 'navi-data/serializers/facts/interface';
import { AsyncQueryResponse, QueryStatus, RequestV2 } from 'navi-data/adapters/facts/interface';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { ExecutionResult, GraphQLError } from 'graphql';

const Payload: AsyncQueryResponse = {
  asyncQuery: {
    edges: [
      {
        node: {
          id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
          query: '"{ "query": "{ tableA { edges { node { datestamp user_count } } } } " }',
          status: QueryStatus.COMPLETE,
          result: {
            contentLength: 129,
            httpStatus: 200,
            recordCount: 2,
            responseBody:
              '{"data":{"tableA":{"edges":[{"node":{"datestamp":"202003", "userCount":10}},{"node":{"datestamp":"202004", "userCount":20}}]}}}',
          },
        },
      },
    ],
  },
};

const Request: RequestV2 = {
  columns: [
    { field: 'datestamp', parameters: {}, type: 'timeDimension' },
    { field: 'userCount', parameters: {}, type: 'metric' },
  ],
  table: 'tableA',
  filters: [],
  sorts: [],
  dataSource: 'elideOne',
  requestVersion: '2.0',
  limit: null,
};

let Serializer: NaviFactSerializer;

module('Unit | Serializer | facts/elide', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function (this: TODO) {
    Serializer = this.owner.lookup('serializer:facts/elide');
  });

  test('it normalizes an elide fact response', function (assert) {
    const { rows, meta } = Serializer.normalize(Payload, Request) as NaviFactResponse;
    assert.deepEqual(
      { rows, meta },
      {
        meta: {},
        rows: [
          {
            datestamp: '202003',
            userCount: 10,
          },
          {
            datestamp: '202004',
            userCount: 20,
          },
        ],
      },
      'normalize transforms the elide raw response into ResponseV1'
    );
  });

  test('it handles an empty elide response', function (assert) {
    const normalized = Serializer.normalize(null, Request);
    assert.deepEqual(normalized, undefined, 'normalize returns undefined when given an empty response');
  });

  test('extractError - apollo error', function (assert) {
    const response: ExecutionResult = {
      errors: [new GraphQLError('Cannot connect to server')],
    };
    const error = Serializer.extractError(response, Request);
    assert.deepEqual(
      error.errors,
      [
        {
          detail: 'Cannot connect to server',
        },
      ],
      '`extractError` populates error object correctly when given an apollo response object'
    );
  });

  test('extractError - elide error', function (assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', field: 'foo', parameters: {} }],
      filters: [],
      sorts: [],
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
    };

    const response: AsyncQueryResponse = {
      asyncQuery: {
        edges: [
          {
            node: {
              id: 'c7d2fe70-b63f-11ea-b45b-bf754c72eca6',
              query: '"{ "query": "{ tableA { edges { node { datestamp user_count } } } } " }',
              status: QueryStatus.COMPLETE,
              result: {
                contentLength: 129,
                httpStatus: 200,
                recordCount: 2,
                responseBody: '{"errors": [ { "message": "bad request" } ] }',
              },
            },
          },
        ],
      },
    };
    const error = Serializer.extractError(response, request);

    assert.deepEqual(
      error.errors,
      [{ detail: 'bad request' }],
      '`extractError` populates error object correctly when given an elide error'
    );
  });
});
