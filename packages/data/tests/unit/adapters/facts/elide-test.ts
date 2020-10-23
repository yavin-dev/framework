import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { asyncFactsMutationStr } from 'navi-data/gql/mutations/async-facts';
import { asyncFactsCancelMutationStr } from 'navi-data/gql/mutations/async-facts-cancel';
import { asyncFactsQueryStr } from 'navi-data/gql/queries/async-facts';
import { QueryStatus, RequestV2 } from 'navi-data/adapters/facts/interface';
import Pretender from 'pretender';
import config from 'ember-get-config';
import moment from 'moment';
import ElideFactsAdapter, { getElideField, ELIDE_API_DATE_FORMAT } from 'navi-data/adapters/facts/elide';
import { exportFactsQueryStr } from 'navi-data/gql/queries/export-facts';

const HOST = config.navi.dataSources[0].uri;
const uuidRegex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const TestRequest: RequestV2 = {
  table: 'table1',
  columns: [
    { field: 'table1.m1', type: 'metric', parameters: {} },
    { field: 'table1.m2', type: 'metric', parameters: {} },
    { field: 'table1.r', type: 'metric', parameters: { p: '123', as: 'a' } },
    { field: 'table1.d1', type: 'dimension', parameters: {} },
    { field: 'table1.d2', type: 'dimension', parameters: {} }
  ],
  filters: [
    { field: 'table1.d3', operator: 'in', values: ['v1', 'v2'], type: 'dimension', parameters: {} },
    { field: 'table1.d4', operator: 'in', values: ['v3', 'v4'], type: 'dimension', parameters: {} },
    { field: 'table1.d5', operator: 'null', values: [], type: 'dimension', parameters: {} },
    { field: 'table1.time', operator: 'gte', values: ['2015-01-03'], type: 'timeDimension', parameters: {} },
    { field: 'table1.time', operator: 'lt', values: ['2015-01-04'], type: 'timeDimension', parameters: {} },
    { field: 'table1.m1', operator: 'gt', values: ['0'], type: 'metric', parameters: {} }
  ],
  sorts: [{ field: 'table1.d1', parameters: {}, type: 'dimension', direction: 'asc' }],
  limit: 10000,
  requestVersion: '2.0',
  dataSource: 'elideOne'
};

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

  test('getElideField', function(assert) {
    assert.equal(getElideField('foo', { bar: 'baz' }), 'foo', 'Field with parameter is not supported');
    assert.equal(
      getElideField('foo', { bar: 'baz', bang: 'boom' }),
      'foo',
      'Field with multiple parameters is not supported'
    );
    assert.equal(getElideField('foo'), 'foo', 'Name is returned for field with no parameters');
  });

  test('dataQueryFromRequest', function(assert) {
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');
    const queryStr = adapter['dataQueryFromRequest'](TestRequest);
    assert.equal(
      queryStr,
      `{"query":"{ table1(filter: \\"d3=in=('v1','v2');d4=in=('v3','v4');d5=isnull=true;time=ge=('2015-01-03');time=lt=('2015-01-04');m1=gt=('0')\\",sort: \\"d1\\",first: \\"10000\\") { edges { node { m1 m2 r d1 d2 } } } }"}`,
      'dataQueryFromRequestV2 returns the correct query string for the given request V2'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [],
        limit: null,
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      `{"query":"{ myTable { edges { node { m1 d1 } } } }"}`,
      'Arguments are properly excluded if they are not in the request'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric', direction: 'desc' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension', direction: 'asc' }
        ],
        filters: [],
        limit: null,
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      `{"query":"{ myTable(sort: \\"-m1,d1\\") { edges { node { m1 d1 } } } }"}`,
      'Request with sorts and parameters is queried correctly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric', operator: 'in', values: ['v1', 'v2'] },
          { field: 'myTable.d1', parameters: {}, type: 'dimension', operator: 'neq', values: ['a'] },
          { field: 'myTable.d2', parameters: {}, type: 'dimension', operator: 'eq', values: ['b'] }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"m1=in=('v1','v2');d1!=('a');d2==('b')\\") { edges { node { m1 d1 } } } }"}`,
      'Request with filters and parameters is queried correctly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [],
        limit: 5,
        requestVersion: '2.0',
        dataSource: 'elideOne'
      }),
      `{"query":"{ myTable(first: \\"5\\") { edges { node { m1 d1 } } } }"}`,
      'Request with limit is queried correctly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric', operator: 'bet', values: ['v1', 'v2'] }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"m1=ge=(v1);m1=le=(v2)\\") { edges { node { m1 d1 } } } }"}`,
      'Request with "between" filter operator splits the filter into two correctly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          { field: 'myTable.m1', parameters: { p: 'q' }, type: 'metric', operator: 'nbet', values: ['v1', 'v2'] }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"m1=lt=(v1),m1=gt=(v2)\\") { edges { node { m1 d1 } } } }"}`,
      'Request with "not between" filter operator splits the filter into two correctly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.time', parameters: { grain: 'month' }, type: 'timeDimension' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          {
            field: 'myTable.time',
            parameters: { grain: 'month' },
            type: 'timeDimension',
            operator: 'bet',
            values: ['P1M', 'current']
          }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"time=ge=(${moment()
        .subtract(1, 'month')
        .format(ELIDE_API_DATE_FORMAT)});time=le=(${moment().format(
        ELIDE_API_DATE_FORMAT
      )})\\") { edges { node { time d1 } } } }"}`,
      'Macros and durations in time-dimension filters are converted to date strings properly'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.time', parameters: { grain: 'day' }, type: 'timeDimension' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          {
            field: 'myTable.time',
            parameters: { grain: 'day' },
            type: 'timeDimension',
            operator: 'null',
            values: []
          }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"time=isnull=true\\") { edges { node { time d1 } } } }"}`,
      'Filter without 2 filter values is unaffected'
    );

    assert.equal(
      adapter['dataQueryFromRequest']({
        table: 'myTable',
        columns: [
          { field: 'myTable.time', parameters: { grain: 'day' }, type: 'timeDimension' },
          { field: 'myTable.d1', parameters: {}, type: 'dimension' }
        ],
        sorts: [],
        filters: [
          {
            field: 'myTable.time',
            parameters: { grain: 'day' },
            type: 'timeDimension',
            operator: 'bet',
            values: ['2020-05-05', '2020-05-09']
          }
        ],
        requestVersion: '2.0',
        dataSource: 'elideOne',
        limit: null
      }),
      `{"query":"{ myTable(filter: \\"time=ge=(2020-05-05);time=le=(2020-05-09)\\") { edges { node { time d1 } } } }"}`,
      'Filter with 2 non-macro date values is unaffected'
    );
  });

  test('createAsyncQuery - success', async function(assert) {
    assert.expect(5);
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.deepEqual(
        Object.keys(requestObj.variables),
        ['id', 'query'],
        'createAsyncQuery sends id and query request variables'
      );

      assert.ok(uuidRegex.exec(requestObj.variables.id), 'A uuid is generated for the request id');

      const expectedTable = TestRequest.table;
      const expectedColumns = TestRequest.columns.map(c => getElideField(c.field, c.parameters)).join(' ');
      const expectedArgs = `(filter: "d3=in=('v1','v2');d4=in=('v3','v4');d5=isnull=true;time=ge=('2015-01-03');time=lt=('2015-01-04');m1=gt=('0')",sort: "d1",first: "10000")`;

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

    const asyncQuery = await adapter.createAsyncQuery(TestRequest);

    assert.deepEqual(asyncQuery, response, 'createAsyncQuery returns the correct response payload');
  });

  test('createAsyncQuery - error', async function(assert) {
    assert.expect(1);

    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

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

    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

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

    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

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

  test('fetchTableExport - success', async function(assert) {
    assert.expect(2);

    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);

      assert.equal(
        requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
        exportFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
        'fetchTableExport sent the correct query to fetch a tableExport'
      );

      response = {
        tableExport: {
          edges: [
            {
              node: {
                id: requestObj.variables.ids[0],
                query: 'foo',
                queryType: 'GRAPHQL_V1_0',
                status: 'COMPLETE',
                result: {
                  httpStatus: '200',
                  url: 'downloadURL',
                  message: ''
                }
              }
            }
          ]
        }
      };

      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });

    const result = await adapter.fetchTableExport('request1');
    assert.deepEqual(result, response, 'fetchTableExport returns the correct response payload');
  });

  test('fetchDataForRequest - success', async function(assert) {
    assert.expect(10);

    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');
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
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

    let errors = [{ message: 'Bad request' }];
    Server.post(`${HOST}/graphql`, () => [400, { 'Content-Type': 'application/json' }, JSON.stringify({ errors })]);

    try {
      await adapter.fetchDataForRequest(TestRequest);
    } catch ({ errors }) {
      const responseText = await errors[0].statusText;
      assert.deepEqual(responseText, errors[0].messages, 'fetchDataForRequest an array of response objects on error');
    }
  });

  test('escaped filter values', async function(assert) {
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');
    const EscapedTest: RequestV2 = {
      table: 'table1',
      columns: [],
      filters: [
        {
          field: 'table1.d6',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['with, comma', 'no comma']
        },
        {
          field: 'table1.d7',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['with "quote"', 'but why']
        },
        {
          field: 'table1.d8',
          parameters: { field: 'id' },
          type: 'dimension',
          operator: 'in',
          values: ['okay', "with 'single quote'"]
        }
      ],
      sorts: [{ field: 'table1.d1', parameters: {}, type: 'dimension', direction: 'asc' }],
      limit: 10000,
      requestVersion: '2.0',
      dataSource: 'elideOne'
    };

    const queryStr = adapter['dataQueryFromRequest'](EscapedTest);

    //test all of the escaped functionalities and verify them in the below assert
    assert.equal(
      queryStr,
      `{"query":"{ table1(filter: \\"d6=in=('with\\\\, comma','no comma');d7=in=('with \\\"quote\\\"','but why');d8=in=('okay','with \\\\'single quote\\\\'')\\\",sort: \\"d1\\",first: \\"10000\\") { edges { node {  } } } }"}`,
      'dataQueryFromRequestV2 returns the correct query string with escaped quotes and commas for the given request V2'
    );
  });

  test('urlForDownloadQuery - success', async function(assert) {
    assert.expect(3);
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');
    const downloadURL = 'downloadURL';
    let response;
    Server.post(`${HOST}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);
      assert.deepEqual(
        Object.keys(requestObj.variables),
        ['id', 'query'],
        'urlForDownloadQuery sends id, query request variables'
      );

      assert.ok(uuidRegex.exec(requestObj.variables.id), 'A uuid is generated for the request id');

      response = {
        tableExport: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                query: requestObj.variables.query,
                status: QueryStatus.COMPLETE,
                result: {
                  httpStatus: 200,
                  url: downloadURL,
                  message: ''
                }
              }
            }
          ]
        }
      };
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({ data: response })];
    });
    const asyncQueryResponse: string = await adapter.urlForDownloadQuery(TestRequest, {});
    assert.deepEqual(asyncQueryResponse, downloadURL, 'urlForDownloadQuery returns the correct response payload');
  });

  test('urlForDownloadQuery - error', async function(assert) {
    assert.expect(1);
    const adapter: ElideFactsAdapter = this.owner.lookup('adapter:facts/elide');

    const response = { errors: [{ message: 'Bad Request' }] };
    Server.post(`${HOST}/graphql`, () => [200, { 'Content-Type': 'application/json' }, JSON.stringify(response)]);

    try {
      await adapter.urlForDownloadQuery(TestRequest, {});
    } catch (error) {
      assert.deepEqual(error, response, 'urlForDownloadQuery returns the error response payload');
    }
  });
});
