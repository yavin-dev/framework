import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { asyncFactsMutationStr } from 'navi-data/gql/mutations/async-facts';
import { asyncFactsCancelMutationStr } from 'navi-data/gql/mutations/async-facts-cancel';
import { asyncFactsQueryStr } from 'navi-data/gql/queries/async-facts';
import Pretender from 'pretender';
import config from 'ember-get-config';
import { v1 } from 'ember-uuid';

const HOST = config.navi.dataSources[0].uri;
const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const TestRequest = {
  logicalTable: {
    table: 'table1',
    timeGrain: 'grain1'
  },
  metrics: [{ metric: 'm1' }, { metric: 'm2' }, { metric: 'r', parameters: { p: '123', as: 'a' } }],
  dimensions: [{ dimension: 'd1' }, { dimension: 'd2' }],
  filters: [
    { dimension: 'd3', operator: 'in', values: ['v1', 'v2'] },
    {
      dimension: 'd4',
      operator: 'in',
      values: ['v3', 'v4']
    },
    { dimension: 'd5', operator: 'notnull', values: [''] }
  ],
  intervals: [
    {
      start: '2015-01-03',
      end: '2015-01-04'
    }
  ],
  having: [
    {
      metric: 'm1',
      operator: 'gt',
      values: [0]
    }
  ]
};

let Server: Pretender;

module('Unit | Adapter | elide facts', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:elide-facts');
    assert.ok(adapter);
  });

  test('createAsyncQueryRequest', async function(assert) {
    assert.expect(5);
    const adapter = this.owner.lookup('adapter:elide-facts');
    let expectedResponse;

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function({ requestBody }) {
        const requestObj = JSON.parse(requestBody);

        assert.deepEqual(
          Object.keys(requestObj.variables),
          ['ids', 'query'],
          'AsyncQuery mutation is sent with ids and a query string'
        );

        assert.ok(uuidRegex.exec(requestObj.variables.ids[0]), 'A uuid is generated for the request id');
        const expectedTable = TestRequest.logicalTable.table;
        const expectedColumns = [
          ...TestRequest.metrics.map(m => m.metric),
          ...TestRequest.dimensions.map(d => d.dimension)
        ].join(' ');
        assert.equal(
          requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
          JSON.stringify({
            query: `
              ${expectedTable} {
                edges {
                  node {
                    ${expectedColumns}
                  }
                }
              }
            `,
            variables: null
          }).replace(/[ \t\r\n]+/g, ' '),
          'The data query is constructed correctly from the request'
        );
        assert.equal(
          requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
          'Correct mutation is sent with new async fact request'
        );

        expectedResponse = {
          asyncQuery: {
            edges: [
              {
                node: {
                  id: requestObj.variables.ids[0],
                  query: requestObj.variables.query,
                  queryType: 'GRAPHQL_V1_0',
                  status: 'QUEUED',
                  result: null
                }
              }
            ]
          }
        };

        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            data: expectedResponse
          })
        ];
      });
    });

    const asyncQuery = await adapter.createAsyncQueryRequest(TestRequest, { clientId: v1() });

    assert.deepEqual(asyncQuery, expectedResponse, 'Data block of the response is returned by the asyncFetch');

    Server.shutdown();
  });

  test('createAsyncQueryRequest - error', async function(assert) {
    assert.expect(1);

    const adapter = this.owner.lookup('adapter:elide-facts');
    const expectedResult = { errors: [{ message: 'Error in graphql query' }] };

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function() {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify(expectedResult)];
      });
    });

    try {
      await adapter.createAsyncQueryRequest(TestRequest, { clientId: v1() });
    } catch (e) {
      assert.deepEqual(e, expectedResult, 'When an error block is present in the response, the promise fails');
    }

    Server.shutdown();
  });

  test('cancelAsyncRequest', async function(assert) {
    assert.expect(2);

    const adapter = this.owner.lookup('adapter:elide-facts');
    let expectedResult;

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function({ requestBody }) {
        const requestObj = JSON.parse(requestBody);

        assert.equal(
          requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsCancelMutationStr.replace(/[ \t\r\n]+/g, ''),
          'Correct mutation is sent with new async fact request'
        );

        expectedResult = {
          asyncQuery: {
            edges: [
              {
                node: {
                  id: requestObj.variables.ids[0],
                  status: 'CANCELLED'
                }
              }
            ]
          }
        };

        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: expectedResult })];
      });
    });

    const result = await adapter.cancelAsyncRequest('request1');
    assert.deepEqual(result, expectedResult, 'API response is returned on cancel');

    Server.shutdown();
  });

  test('fetchAsyncQueryData', async function(assert) {
    assert.expect(2);

    const adapter = this.owner.lookup('adapter:elide-facts');
    let expectedResult;

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function({ requestBody }) {
        const requestObj = JSON.parse(requestBody);

        assert.equal(
          requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
          'Correct query is sent with new async fact request'
        );

        expectedResult = {
          asyncQuery: {
            edges: [
              {
                node: {
                  id: requestObj.variables.ids[0],
                  query: 'foo',
                  queryType: 'GRAPHQL_V1_0',
                  status: 'COMPLETE',
                  result: {
                    httpStatus: '200',
                    contentLength: 2,
                    responseBody: JSON.stringify({
                      table: {
                        edges: [
                          {
                            node: {
                              metric: 123,
                              dimension: 'foo'
                            }
                          }
                        ]
                      }
                    })
                  }
                }
              }
            ]
          }
        };

        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: expectedResult })];
      });
    });

    const result = await adapter.fetchAsyncQueryData('request1');
    assert.deepEqual(result, expectedResult, 'API response is returned on cancel');

    Server.shutdown();
  });

  test('fetchDataForRequest', async function(assert) {
    assert.expect(10);
    const adapter = this.owner.lookup('adapter:elide-facts');
    adapter._pollingInterval = 300;
    let callCount = 0;
    let expectedResponse: Record<string, any> = {};
    let queryVariable: string;
    let queryId: string;

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function({ requestBody }) {
        callCount++;
        let result = null;
        const { query, variables } = JSON.parse(requestBody);

        if (callCount === 1) {
          queryVariable = variables.query;
          queryId = variables.ids[0];

          assert.equal(
            query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
            asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
            'Mutation is first request sent'
          );
        } else if (callCount < 6) {
          assert.equal(
            query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
            asyncFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
            'AsyncQuery fetch is sent in the follow-up requests'
          );
          assert.equal(variables.ids[0], queryId, 'Same id is sent for mutation and query');

          if (callCount === 5) {
            result = {
              httpStatus: 200,
              contentLength: 1,
              responseBody: JSON.stringify({
                data: {
                  tableName: {
                    edges: [
                      {
                        node: {
                          column1: '123',
                          column2: '321'
                        }
                      }
                    ]
                  }
                }
              })
            };
          }
        } else {
          assert.ok(false, 'Polling did not stop after a response was returned');
        }

        expectedResponse = {
          asyncQuery: {
            edges: [
              {
                node: {
                  id: queryId,
                  query: queryVariable,
                  queryType: 'GRAPHQL_V1_0',
                  status: 'QUEUED',
                  result
                }
              }
            ]
          }
        };

        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            data: expectedResponse
          })
        ];
      });
    });

    const result = await adapter.fetchDataForRequest.perform(TestRequest);
    assert.deepEqual(result, expectedResponse.asyncQuery?.edges[0].node.result, 'Result has correct format');

    Server.shutdown();
  });

  test('fetchDataForRequest - error', async function(assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:elide-facts');
    let expectedResponse: Record<string, any> = {};

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function() {
        expectedResponse = [
          {
            message: 'Error: Unable to fetch data for AsyncRequest'
          }
        ];

        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            errors: expectedResponse
          })
        ];
      });
    });

    try {
      await adapter.fetchDataForRequest.perform(TestRequest);
    } catch (e) {
      assert.deepEqual(e.errors, expectedResponse, 'API errors are propagated down when received by the adapter');
    }

    Server.shutdown();
  });
});
