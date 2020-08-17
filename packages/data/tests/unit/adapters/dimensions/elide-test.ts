import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import { asyncFactsMutationStr } from 'navi-data/gql/mutations/async-facts';
import { asyncFactsQueryStr } from 'navi-data/gql/queries/async-facts';
import Pretender from 'pretender';

let Server: Pretender;

module('Unit | Adapter | Dimensions | Elide', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Server = new Pretender();
  });

  hooks.afterEach(function() {
    //shutdown pretender
    Server.shutdown();
  });

  test('find', async function(assert) {
    assert.expect(6);
    const {
      navi: { dataSources }
    } = config;
    const adapter = this.owner.lookup('adapter:dimensions/elide');
    const TestDimensionColumn = {
      columnMetadata: {
        id: 'dimension1',
        source: 'elideTwo',
        tableId: 'table1'
      },
      parameters: {
        foo: 'bar'
      }
    };
    const HOST = dataSources.find(d => d.name === 'elideTwo') || dataSources[0];

    let callCount = 0;
    let queryVariable: string;
    let queryId: string;

    let response: TODO;
    Server.post(`${HOST.uri}/graphql`, function({ requestBody }) {
      callCount++;
      let result = null;
      let status = 'QUEUED';
      const requestObj = JSON.parse(requestBody);

      if (callCount === 1) {
        queryId = requestObj.variables.id;
        queryVariable = requestObj.variables.query;

        assert.deepEqual(
          Object.keys(requestObj.variables),
          ['id', 'query'],
          'find sends id and query request variables'
        );

        const expectedTable = TestDimensionColumn.columnMetadata.tableId;
        const expectedColumns = 'dimension1(foo: bar)';
        const expectedArgs = '(filter: \\"dimension1(foo: bar)=in=(v1,v2)\\")';

        assert.equal(
          requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
          JSON.stringify({
            query: `{ ${expectedTable}${expectedArgs} { edges { node { ${expectedColumns} } } } }`
          }).replace(/[ \t\r\n]+/g, ' '),
          'find sends the correct query variable string (with filter) to the datasource specified in the metadata'
        );

        assert.equal(
          requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsMutationStr.replace(/[ \t\r\n]+/g, ''),
          'find sends the correct mutation to create a new asyncQuery'
        );
      } else {
        status = 'COMPLETE';
        assert.equal(
          requestObj.query.replace(/__typename/g, '').replace(/[ \t\r\n]+/g, ''),
          asyncFactsQueryStr.replace(/[ \t\r\n]+/g, ''),
          'find polls for the asyncQuery to complete'
        );
        assert.equal(
          requestObj.variables.ids[0],
          queryId,
          'when the find function polls, it requests the same asyncQuery id as the one it created'
        );
        const values = ['v1', 'v2'];

        result = {
          httpStatus: 200,
          contentLength: 1,
          responseBody: JSON.stringify({
            data: {
              table1: {
                edges: values.map(v => ({
                  node: { dimension1: v }
                }))
              }
            }
          })
        };
      }

      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: queryId,
                query: queryVariable,
                queryType: 'GRAPHQL_V1_0',
                status,
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
          data: response
        })
      ];
    });
    const find = await adapter.find(TestDimensionColumn, [{ operator: 'in', values: ['v1', 'v2'] }]);

    assert.deepEqual(find, response, 'find returns the correct response payload');
  });

  test('all', async function(assert) {
    assert.expect(2);
    const {
      navi: { dataSources }
    } = config;
    const adapter = this.owner.lookup('adapter:dimensions/elide');
    const TestDimensionColumn = {
      columnMetadata: {
        id: 'dimension1',
        source: 'elideOne',
        tableId: 'table1'
      },
      parameters: {
        foo: 'bar'
      }
    };
    const myDataSource = dataSources.find(d => d.name === 'elideOne') || dataSources[0];
    let response;

    Server.post(`${myDataSource.uri}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);
      const expectedTable = TestDimensionColumn.columnMetadata.tableId;
      const expectedColumns = 'dimension1(foo: bar)';

      assert.equal(
        requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
        JSON.stringify({
          query: `{ ${expectedTable} { edges { node { ${expectedColumns} } } } }`
        }).replace(/[ \t\r\n]+/g, ' '),
        'all sends the correct query variable string (with filter) to the datasource specified in the metadata'
      );
      const values = ['v1', 'v2', 'something cool', 'bad something'];
      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                query: requestObj.variables.query,
                queryType: 'GRAPHQL_V1_0',
                status: 'COMPLETE',
                result: {
                  httpStatus: 200,
                  contentLength: 1,
                  responseBody: JSON.stringify({
                    data: {
                      table1: {
                        edges: values.map(v => ({
                          node: { dimension1: v }
                        }))
                      }
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

    const adapterResponse = await adapter.all(TestDimensionColumn);

    assert.deepEqual(adapterResponse, response, 'all returns the payload from graphql');
  });

  test('search', async function(assert) {
    assert.expect(2);
    const {
      navi: { dataSources }
    } = config;
    const adapter = this.owner.lookup('adapter:dimensions/elide');
    const TestDimensionColumn = {
      columnMetadata: {
        id: 'dimension2',
        source: 'elideTwo',
        tableId: 'table2'
      },
      parameters: {
        foo: 'baz'
      }
    };
    const myDataSource = dataSources.find(d => d.name === 'elideTwo') || dataSources[0];
    let response;

    Server.post(`${myDataSource.uri}/graphql`, function({ requestBody }) {
      const requestObj = JSON.parse(requestBody);
      const expectedTable = TestDimensionColumn.columnMetadata.tableId;
      const expectedColumns = 'dimension2(foo: baz)';
      const expectedArgs = '(filter: \\"dimension2(foo: baz)==(*something*)\\")';

      assert.equal(
        requestObj.variables.query.replace(/[ \t\r\n]+/g, ' '),
        JSON.stringify({
          query: `{ ${expectedTable}${expectedArgs} { edges { node { ${expectedColumns} } } } }`
        }).replace(/[ \t\r\n]+/g, ' '),
        'search sends the correct query variable string (with search filter) to the datasource specified in the metadata'
      );
      const values = ['something cool', 'bad something'];
      response = {
        asyncQuery: {
          edges: [
            {
              node: {
                id: requestObj.variables.id,
                query: requestObj.variables.query,
                queryType: 'GRAPHQL_V1_0',
                status: 'COMPLETE',
                result: {
                  httpStatus: 200,
                  contentLength: 1,
                  responseBody: JSON.stringify({
                    data: {
                      table2: {
                        edges: values.map(v => ({
                          node: { dimension2: v }
                        }))
                      }
                    }
                  })
                }
              }
            }
          ]
        }
      };

      return [
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          data: response
        })
      ];
    });

    const adapterResponse = await adapter.search(TestDimensionColumn, 'something');

    assert.deepEqual(adapterResponse, response, 'search returns the payload from graphql');
  });
});
