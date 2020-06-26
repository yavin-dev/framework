import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { asyncFactsMutationStr } from 'navi-data/gql/mutations/async-facts';
import { asyncFactsCancelMutationStr } from 'navi-data/gql/mutations/async-facts-cancel';
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

  test('asyncFetchDataForRequest', async function(assert) {
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

    const asyncQuery = await adapter.asyncFetchDataForRequest(TestRequest, { clientId: v1() });

    assert.deepEqual(asyncQuery, expectedResponse, 'Data block of the response is returned by the asyncFetch');

    Server.shutdown();
  });

  test('asyncFetchDataForRequest - error', async function(assert) {
    assert.expect(1);

    const adapter = this.owner.lookup('adapter:elide-facts');
    const expectedResult = { errors: [{ message: 'Error in graphql query' }] };

    Server = new Pretender(function() {
      this.post(`${HOST}/graphql`, function() {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify(expectedResult)];
      });
    });

    try {
      await adapter.asyncFetchDataForRequest(TestRequest, { clientId: v1() });
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
});
