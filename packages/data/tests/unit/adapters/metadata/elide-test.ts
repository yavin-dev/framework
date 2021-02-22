import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GQLQueries from 'navi-data/gql/metadata-queries';
import { print } from 'graphql/language/printer';
import scenario from 'navi-data/mirage/scenarios/elide-one';
import ElideMetadataAdapter from 'navi-data/adapters/metadata/elide';
import { TestContext } from 'ember-test-helpers';

// Apollo includes this field in its queries, but we don't want to compare against that in our tests
const removeTypeNameField = (query: string) => query.replace(/\n\s*__typename/g, '').trim();

interface MirageTestContext extends TestContext {
  server: TODO;
}

module('Unit | Adapter | metadata/elide', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let Adapter: ElideMetadataAdapter;

  hooks.beforeEach(function (this: MirageTestContext) {
    Adapter = this.owner.lookup('adapter:metadata/elide');
  });

  /*
   * Test whether the url path is built correctly
   */
  test('fetchAll - request format', async function (this: MirageTestContext, assert) {
    assert.expect(3);

    const gqlQuery = print(GQLQueries.table.all).trim(); //GQL Query as string

    this.server.post('https://data.naviapp.io', (_schema: TODO, { requestBody }: { requestBody: string }) => {
      const { operationName, variables, query } = JSON.parse(requestBody);

      assert.notOk(operationName, 'No operation name specified');
      assert.deepEqual(variables, {}, 'No variables are passed in options');
      assert.equal(
        removeTypeNameField(query),
        gqlQuery,
        'The appropriate gql query is sent as a post to the graphql endpoint'
      );

      return [];
    });
    await Adapter.fetchAll('table');
  });

  test('fetchById - request format', async function (this: MirageTestContext, assert) {
    assert.expect(3);

    const gqlQuery = print(GQLQueries.table.single).trim(); //GQL Query as string

    this.server.post('https://data.naviapp.io', (_schema: TODO, { requestBody }: { requestBody: string }) => {
      const { operationName, variables, query } = JSON.parse(requestBody);

      assert.notOk(operationName, 'No operation name specified');
      assert.deepEqual(variables, { ids: ['foo'] }, 'id variable is passed in options');
      assert.equal(
        removeTypeNameField(query),
        gqlQuery,
        'The appropriate gql query is sent as a post to the graphql endpoint'
      );

      return [];
    });
    await Adapter.fetchById('table', 'foo');
  });

  test('fetchAll - response', async function (this: MirageTestContext, assert) {
    assert.expect(6);

    // Seed our mirage database
    scenario(this.server);

    const expectedFields = [
      'id',
      'name',
      'friendlyName',
      'description',
      'category',
      'cardinality',
      'isFact',
      'metrics',
      'dimensions',
      'timeDimensions',
      '__typename',
    ];

    const { table: tableConnection } = await Adapter.fetchAll('table', {
      dataSourceName: 'elideOne',
    });
    const tables = tableConnection.edges.map((edge: TODO) => edge.node);

    // Test that all fields specified in the query are included in the result and none of them are null as they should be populated by the factories
    assert.deepEqual(
      tables.map(Object.keys),
      [expectedFields, expectedFields],
      'Both tables in the mirage database are returned with the expected fields for every table'
    );
    assert.ok(
      tables.every((table: TODO) => Object.keys(table).every((key) => !!table[key])),
      'No null values returned in table fields'
    );

    // First table metrics and dimensions
    assert.deepEqual(
      tables[0].metrics,
      {
        __typename: 'MetricConnection',
        edges: [
          {
            node: {
              id: 'table0.metric0',
              name: 'metric0',
              friendlyName: 'Metric 0',
              description: 'This is metric 0',
              category: 'categoryOne',
              valueType: 'NUMBER',
              tags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Metric',
            },
            __typename: 'MetricEdge',
          },
          {
            node: {
              id: 'table0.metric1',
              name: 'metric1',
              friendlyName: 'Metric 1',
              description: 'This is metric 1',
              category: 'categoryOne',
              valueType: 'NUMBER',
              tags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Metric',
            },
            __typename: 'MetricEdge',
          },
          {
            node: {
              id: 'table0.metric2',
              name: 'metric2',
              friendlyName: 'Metric 2',
              description: 'This is metric 2',
              category: 'categoryOne',
              valueType: 'NUMBER',
              tags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Metric',
            },
            __typename: 'MetricEdge',
          },
        ],
      },
      'The expected metrics are returned when querying table 0'
    );

    assert.deepEqual(
      tables[0].dimensions,
      {
        __typename: 'DimensionConnection',
        edges: [
          {
            __typename: 'DimensionEdge',
            node: {
              __typename: 'Dimension',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 0',
              expression: null,
              id: 'table0.dimension0',
              name: 'dimension0',
              friendlyName: 'Dimension 0',
              tableSource: null,
              tags: ['DISPLAY'],
              valueSourceType: 'NONE',
              valueType: 'TEXT',
              values: [],
            },
          },
          {
            __typename: 'DimensionEdge',
            node: {
              __typename: 'Dimension',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 1',
              expression: null,
              id: 'table0.dimension1',
              name: 'dimension1',
              friendlyName: 'Dimension 1',
              tableSource: null,
              tags: ['DISPLAY'],
              valueSourceType: 'ENUM',
              valueType: 'TEXT',
              values: [
                'Practical Frozen Fish (enum)',
                'Practical Concrete Chair (enum)',
                'Awesome Steel Chicken (enum)',
                'Tasty Fresh Towels (enum)',
                'Intelligent Steel Pizza (enum)',
              ],
            },
          },
          {
            __typename: 'DimensionEdge',
            node: {
              __typename: 'Dimension',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 2',
              expression: null,
              id: 'table0.dimension2',
              name: 'dimension2',
              friendlyName: 'Dimension 2',
              tableSource: 'table0.dimension0',
              tags: ['DISPLAY'],
              valueSourceType: 'TABLE',
              valueType: 'TEXT',
              values: [],
            },
          },
        ],
      },
      'All dimensions and the requested fields are returned for table 0'
    );

    // Second Table metrics and dimensions
    assert.deepEqual(
      tables[1].metrics,
      {
        __typename: 'MetricConnection',
        edges: [
          {
            node: {
              id: 'table1.metric3',
              name: 'metric3',
              friendlyName: 'Metric 3',
              description: 'This is metric 3',
              category: 'categoryOne',
              valueType: 'NUMBER',
              tags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Metric',
            },
            __typename: 'MetricEdge',
          },
          {
            node: {
              id: 'table1.metric4',
              name: 'metric4',
              friendlyName: 'Metric 4',
              description: 'This is metric 4',
              category: 'categoryOne',
              valueType: 'NUMBER',
              tags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Metric',
            },
            __typename: 'MetricEdge',
          },
        ],
      },
      'Metrics for the second table are included when requested'
    );

    assert.deepEqual(
      tables[1].dimensions,
      {
        edges: [],
        __typename: 'DimensionConnection',
      },
      'Table with no dimensions returns an empty edges array for dimensions'
    );
  });

  test('fetchById - response', async function (this: MirageTestContext, assert) {
    assert.expect(1);

    // Seed our mirage database
    scenario(this.server);

    const result = await Adapter.fetchById('table', 'table0', {
      dataSourceName: 'elideOne',
    });

    assert.deepEqual(
      result,
      {
        table: {
          __typename: 'TableConnection',
          edges: [
            {
              __typename: 'TableEdge',
              node: {
                id: 'table0',
                name: 'table0',
                friendlyName: 'Table 0',
                description: 'This is Table 0',
                category: 'categoryOne',
                cardinality: 'SMALL',
                isFact: true,
                metrics: {
                  edges: [
                    {
                      node: {
                        id: 'table0.metric0',
                        name: 'metric0',
                        friendlyName: 'Metric 0',
                        description: 'This is metric 0',
                        category: 'categoryOne',
                        valueType: 'NUMBER',
                        tags: ['DISPLAY'],
                        columnType: 'field',
                        expression: null,
                        __typename: 'Metric',
                      },
                      __typename: 'MetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric1',
                        name: 'metric1',
                        friendlyName: 'Metric 1',
                        description: 'This is metric 1',
                        category: 'categoryOne',
                        valueType: 'NUMBER',
                        tags: ['DISPLAY'],
                        columnType: 'field',
                        expression: null,
                        __typename: 'Metric',
                      },
                      __typename: 'MetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric2',
                        name: 'metric2',
                        friendlyName: 'Metric 2',
                        description: 'This is metric 2',
                        category: 'categoryOne',
                        valueType: 'NUMBER',
                        tags: ['DISPLAY'],
                        columnType: 'field',
                        expression: null,
                        __typename: 'Metric',
                      },
                      __typename: 'MetricEdge',
                    },
                  ],
                  __typename: 'MetricConnection',
                },
                dimensions: {
                  edges: [
                    {
                      __typename: 'DimensionEdge',
                      node: {
                        __typename: 'Dimension',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 0',
                        expression: null,
                        id: 'table0.dimension0',
                        name: 'dimension0',
                        friendlyName: 'Dimension 0',
                        tableSource: null,
                        tags: ['DISPLAY'],
                        valueSourceType: 'NONE',
                        valueType: 'TEXT',
                        values: [],
                      },
                    },
                    {
                      __typename: 'DimensionEdge',
                      node: {
                        __typename: 'Dimension',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 1',
                        expression: null,
                        id: 'table0.dimension1',
                        name: 'dimension1',
                        friendlyName: 'Dimension 1',
                        tableSource: null,
                        tags: ['DISPLAY'],
                        valueSourceType: 'ENUM',
                        valueType: 'TEXT',
                        values: [
                          'Practical Frozen Fish (enum)',
                          'Practical Concrete Chair (enum)',
                          'Awesome Steel Chicken (enum)',
                          'Tasty Fresh Towels (enum)',
                          'Intelligent Steel Pizza (enum)',
                        ],
                      },
                    },
                    {
                      __typename: 'DimensionEdge',
                      node: {
                        __typename: 'Dimension',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 2',
                        expression: null,
                        id: 'table0.dimension2',
                        name: 'dimension2',
                        friendlyName: 'Dimension 2',
                        tableSource: 'table0.dimension0',
                        tags: ['DISPLAY'],
                        valueSourceType: 'TABLE',
                        valueType: 'TEXT',
                        values: [],
                      },
                    },
                  ],
                  __typename: 'DimensionConnection',
                },
                timeDimensions: {
                  edges: [],
                  __typename: 'TimeDimensionConnection',
                },
                __typename: 'Table',
              },
            },
          ],
        },
      },
      'The expected table is returned with all requested fields'
    );
  });

  test('fetchEverything - response', async function (this: MirageTestContext, assert) {
    const allTables = await Adapter.fetchAll('table', {
      dataSourceName: 'elideOne',
    });
    const everything = await Adapter.fetchEverything({
      dataSourceName: 'elideOne',
    });
    assert.deepEqual(everything, allTables, "`fetchEverything` returns the same payload `fetchAll('table')`");
  });
});
