import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { asyncFactsMutationStr } from 'navi-data/gql/mutations/async-facts';
import { asyncFactsCancelMutationStr } from 'navi-data/gql/mutations/async-facts-cancel';
import { asyncFactsQueryStr } from 'navi-data/gql/queries/async-facts';
import { RequestV2 } from 'navi-data/adapters/facts/interface';
import Pretender from 'pretender';
import config from 'ember-get-config';
import { getElideField } from 'navi-data/adapters/facts/elide';

const HOST = config.navi.dataSources[0].uri;
const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const TestRequest = {
  logicalTable: { table: 'table1', timeGrain: 'grain1' },
  metrics: [{ metric: 'm1' }, { metric: 'm2' }, { metric: 'r', parameters: { p: '123', as: 'a' } }],
  dimensions: [{ dimension: 'd1' }, { dimension: 'd2' }],
  filters: [
    { dimension: 'd3', operator: 'in', values: ['v1', 'v2'] },
    { dimension: 'd4', operator: 'in', values: ['v3', 'v4'] },
    { dimension: 'd5', operator: 'isnull', values: ['false'] }
  ],
  intervals: [{ start: '2015-01-03', end: '2015-01-04' }],
  having: [{ metric: 'm1', operator: 'gt', values: [0] }]
};

const TestRequestV2: RequestV2 = {
  table: 'table1',
  columns: [
    { field: 'm1', type: 'metric', parameters: {} },
    { field: 'm2', type: 'metric', parameters: {} },
    { field: 'r', type: 'metric', parameters: { p: '123', as: 'a' } },
    { field: 'd1', type: 'dimension', parameters: {} },
    { field: 'd2', type: 'dimension', parameters: {} }
  ],
  filters: [
    { field: 'd3', operator: 'in', values: ['v1', 'v2'], type: 'dimension', parameters: {} },
    { field: 'd4', operator: 'in', values: ['v3', 'v4'], type: 'dimension', parameters: {} },
    { field: 'd5', operator: 'isnull', values: ['false'], type: 'dimension', parameters: {} },
    { field: 'time', operator: 'ge', values: ['2015-01-03'], type: 'timeDimension', parameters: {} },
    { field: 'time', operator: 'lt', values: ['2015-01-04'], type: 'timeDimension', parameters: {} },
    { field: 'm1', operator: 'gt', values: ['0'], type: 'metric', parameters: {} }
  ],
  sorts: [{ field: 'd1', parameters: {}, type: 'dimension', direction: 'asc' }],
  limit: '10000',
  requestVersion: '2.0',
  dataSource: 'elideOne'
};

// Double the escaped characters as well as escape the double quote character
function escapeQuotes(str: string) {
  return str.replace(/\\"/g, '\\\\\\"');
}

let Server: Pretender;

module('Unit | Adapter | facts/elide', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Server = new Pretender();
  });

  hooks.afterEach(function() {
    Server.shutdown();
  });

  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:facts/elide');
    assert.ok(adapter, 'elide-fact adapter exists');
  });

  test('queryStrForField', function(assert) {
    assert.equal(getElideField('foo', { bar: 'baz' }), 'foo(bar: baz)', 'Field with parameter is formatted correctly');
    assert.equal(
      getElideField('foo', { bar: 'baz', bang: 'boom' }),
      'foo(bar: baz,bang: boom)',
      'Field with multiple parameters is formatted correctly'
    );
    assert.equal(getElideField('foo'), 'foo', 'Name is returned for field with no parameters');
  });

  test('dataQueryFromRequest', function(assert) {
    const adapter = this.owner.lookup('adapter:facts/elide');
    const queryStr = adapter.dataQueryFromRequest(TestRequest);
    assert.equal(
      queryStr,
      '{"query":"{ table1 { edges { node { m1 m2 r d1 d2 } } } }"}',
      'dataQueryFromRequest returns the correct query string for the given request'
    );
  });

  test('dataQueryFromRequestV2', function(assert) {
    const adapter = this.owner.lookup('adapter:facts/elide');
    const queryStr = adapter.dataQueryFromRequestV2(TestRequestV2);
    assert.equal(
      queryStr,
      escapeQuotes(
        '{"query":"{ table1(filter: \\"d3=in=(v1,v2);d4=in=(v3,v4);d5=isnull=(false);time=ge=(2015-01-03);time=lt=(2015-01-04);m1=gt=(0)\\",sort: \\"d1\\",first: \\"10000\\") { edges { node { m1 m2 r(p: 123,as: a) d1 d2 } } } }"}'
      ),
      'dataQueryFromRequestV2 returns the correct query string for the given request V2'
    );

    assert.equal(
      adapter.dataQueryFromRequestV2({
        table: 'myTable',
        columns: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'd1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [],
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      `{"query":"{ myTable { edges { node { m1(p: q) d1 } } } }"}`,
      'Arguments are properly excluded if they are not in the request'
    );

    assert.equal(
      adapter.dataQueryFromRequestV2({
        table: 'myTable',
        columns: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'd1', parameters: {}, type: 'dimension' }
        ],
        sorts: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric', direction: 'desc' },
          { field: 'd1', parameters: {}, type: 'dimension', direction: 'asc' }
        ],
        filters: [],
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      escapeQuotes(`{"query":"{ myTable(sort: \\"-m1(p: q),d1\\") { edges { node { m1(p: q) d1 } } } }"}`),
      'Request with sorts and parameters is queried correctly'
    );

    assert.equal(
      adapter.dataQueryFromRequestV2({
        table: 'myTable',
        columns: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'd1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric', operator: 'in', values: ['v1', 'v2'] },
          { field: 'd1', parameters: {}, type: 'dimension', operator: 'neq', values: ['a'] },
          { field: 'd2', parameters: {}, type: 'dimension', operator: 'eq', values: ['b'] }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      escapeQuotes(
        `{"query":"{ myTable(filter: \\"m1(p: q)=in=(v1,v2);d1!=(a);d2==(b)\\") { edges { node { m1(p: q) d1 } } } }"}`
      ),
      'Request with filters and parameters is queried correctly'
    );

    assert.equal(
      adapter.dataQueryFromRequestV2({
        table: 'myTable',
        columns: [
          { field: 'm1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'd1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [],
        limit: '5',
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      escapeQuotes(`{"query":"{ myTable(first: \\"5\\") { edges { node { m1(p: q) d1 } } } }"}`),
      'Request with limit is queried correctly'
    );
  });

  test('createAsyncQuery - success', async function(assert) {
    assert.expect(5);
    const adapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.deepEqual(
        Object.keys(requestObj.variables),
        ['id', 'query'],
        'createAsyncQuery sends id and query request variables'
      );

      assert.ok(uuidRegex.exec(requestObj.variables.id), 'A uuid is generated for the request id');

      const expectedTable = TestRequest.logicalTable.table;
      const expectedColumns = [
        ...TestRequest.metrics.map(m => m.metric),
        ...TestRequest.dimensions.map(d => d.dimension)
      ].join(' ');

      assert.equal(
        requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
        JSON.stringify({
          query: `{ ${expectedTable} { edges { node { ${expectedColumns} } } } }`
        }).replace(/[ \t\r\n]+/g, ' '),
        'createAsyncQuery send the correct query variable string'
      );

      assert.equal(
        requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
        asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
        'createAsyncQuery sends the correct mutation to create a new asyncQuery'
      );

      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                query: requestObj.variables.query,
                queryType: 'GRAPHQL_V1_0',
                status: 'QUEUED',
                result: null
              }
            }
          ]
        }
      };

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const asyncQuery = await adapter.createAsyncQuery(TestRequest);

    assert.deepEqual(asyncQuery, response, 'createAsyncQuery returns the correct response payload');
  });

  test('createAsyncQuery (RequestV2) - success', async function(assert) {
    assert.expect(5);
    const adapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.deepEqual(
        Object.keys(requestObj.variables),
        ['id', 'query'],
        'createAsyncQuery sends id and query request variables'
      );

      assert.ok(uuidRegex.exec(requestObj.variables.id), 'A uuid is generated for the request id');

      const expectedTable = TestRequestV2.table;
      const expectedColumns = TestRequestV2.columns.map(c => getElideField(c.field, c.parameters)).join(' ');
      const expectedArgs =
        '(filter: \\"d3=in=(v1,v2);d4=in=(v3,v4);d5=isnull=(false);time=ge=(2015-01-03);time=lt=(2015-01-04);m1=gt=(0)\\",sort: \\"d1\\",first: \\"10000\\")';

      assert.equal(
        requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
        JSON.stringify({
          query: `{ ${expectedTable}${expectedArgs} { edges { node { ${expectedColumns} } } } }`
        }).replace(/[ \t\r\n]+/g, ' '),
        'createAsyncQuery sends the correct query variable string'
      );

      assert.equal(
        requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
        asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
        'createAsyncQuery sends the correct mutation to create a new asyncQuery'
      );

      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                query: requestObj.variables.query,
                queryType: 'GRAPHQL_V1_0',
                status: 'QUEUED',
                result: null
              }
            }
          ]
        }
      };

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const asyncQuery = await adapter.createAsyncQuery(TestRequestV2);

    assert.deepEqual(asyncQuery, response, 'createAsyncQuery returns the correct response payload');
  });

  test('createAsyncQuery - error', async function(assert) {
    assert.expect(1);

    const adapter = this.owner.lookup('adapter:facts/elide');

    const response = { errors: [{ message: 'Error in graphql query' }] };
    Server.post(`${HOST}/graphql`, () => [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);

    try {
      await adapter.createAsyncQuery(TestRequest);
    } catch (error) {
      assert.deepEqual(error, response, 'createAsyncQuery returns the error response payload');
    }
  });

  test('cancelAsyncQuery - success', async function(assert) {
    assert.expect(2);

    const adapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.equal(
        requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
        asyncFactsCancelMutationStr.replace(/[ \t\r\n]+/g, ''),
        'cancelAsyncQuery sends the correct mutation to cancel an asyncQuery'
      );

      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                status: 'CANCELLED'
              }
            }
          ]
        }
      };

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const result = await adapter.cancelAsyncQuery('request1');
    assert.deepEqual(result, response, 'createAsyncQuery returns the correct response payload');
  });

  test('fetchAsyncQuery - success', async function(assert) {
    assert.expect(2);

    const adapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.equal(
        requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
        asyncFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
        'fetchAsyncQuery sent the correct query to fetch an asyncQuery'
      );

      response = {
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

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const result = await adapter.fetchAsyncQuery('request1');
    assert.deepEqual(result, response, 'fetchAsyncQuery returns the correct response payload');
  });

  test('fetchDataForRequest - success', async function(assert) {
    assert.expect(10);

    const adapter = this.owner.lookup('adapter:facts/elide');
    adapter._pollingInterval = 300;

    let callCount = 0;
    let queryVariable: string;
    let queryId: string;

    let response: TODO;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      callCount++;
      let result = null;
      const { query, variables } = JSON.parse(requestBody);

      if (callCount === 1) {
        queryVariable = variables.query;
        queryId = variables.id;

        assert.equal(
          query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
          'fetchDataForRequest first creates an asyncQuery'
        );
      } else if (callCount < 6) {
        assert.equal(
          query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
          'fetchDataForRequest polls for the asyncQuery to complete'
        );
        assert.equal(
          variables.ids[0],
          queryId,
          'fetchDataForRequest requests the same asyncQuery id as the one it created'
        );

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
        assert.ok(false, 'Error: fetchDataForRequest did not for the asyncQuery to complete');
      }

      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: queryId,
                query: queryVariable,
                queryType: 'GRAPHQL_V1_0',
                status: callCount !== 5 ? 'QUEUED' : 'COMPLETE',
                result
              }
            }
          ]
        }
      };

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const result = await adapter.fetchDataForRequest(TestRequest);
    assert.deepEqual(result, response, 'fetchDataForRequest returns the correct response payload');
  });

  test('fetchDataForRequest - error', async function(assert) {
    assert.expect(1);
    const adapter = this.owner.lookup('adapter:facts/elide');

    let errors = [{ message: 'Bad request' }];
    Server.post(`${HOST}/graphql`, () => [400, { 'Content-Type': 'application/json' }, JSON.stringify({ errors })]);

    try {
      await adapter.fetchDataForRequest(TestRequest);
    } catch ({ errors }) {
      const responseText = await errors[0].statusText;
      assert.deepEqual(responseText, errors[0].messages, 'fetchDataForRequest an array of response objects on error');
    }
  });
});
