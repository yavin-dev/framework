import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GQLQueries from 'navi-data/gql/metadata-queries';
import { print } from 'graphql/language/printer';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import ElideWithNamespaceScenario from 'navi-data/mirage/scenarios/elide-with-namespace';
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
    assert.expect(6);

    const gqlQuery = print(GQLQueries.table.all).trim(); //GQL Query as string
    const expectedNamespace = ['default', 'DemoNamespace'];
    let i = 0;

    this.server.post('https://data.naviapp.io/graphql', (_schema: TODO, { requestBody }: { requestBody: string }) => {
      const { operationName, variables, query } = JSON.parse(requestBody);

      assert.equal(operationName, 'GetTables', 'operation name is correct');
      assert.deepEqual(
        variables,
        { filter: `namespace.id=='${expectedNamespace[i]}'` },
        'Correct namespace filter is passed in options'
      );
      assert.equal(
        removeTypeNameField(query),
        gqlQuery,
        'The appropriate gql query is sent as a post to the graphql endpoint'
      );

      i++;
      return [];
    });

    await Adapter.fetchAll('table', { dataSourceName: 'elideOne' });
    await Adapter.fetchAll('table', { dataSourceName: 'elideWithNamespace' });
  });

  test('fetchById - request format', async function (this: MirageTestContext, assert) {
    assert.expect(6);

    const gqlQuery = print(GQLQueries.table.single).trim(); //GQL Query as string
    const expectedNamespace = ['default', 'DemoNamespace'];
    let i = 0;

    this.server.post('https://data.naviapp.io/graphql', (_schema: TODO, { requestBody }: { requestBody: string }) => {
      const { operationName, variables, query } = JSON.parse(requestBody);

      assert.equal(operationName, 'GetTable', 'operation name is correct');
      assert.deepEqual(
        variables,
        { filter: `namespace.id=='${expectedNamespace[i]}'`, ids: ['foo'] },
        'Correct namespace filter and id variable are passed in options'
      );
      assert.equal(
        removeTypeNameField(query),
        gqlQuery,
        'The appropriate gql query is sent as a post to the graphql endpoint'
      );

      i++;
      return [];
    });
    await Adapter.fetchById('table', 'foo', { dataSourceName: 'elideOne' });
    await Adapter.fetchById('table', 'foo', { dataSourceName: 'elideWithNamespace' });
  });

  test('fetchById - request headers', async function (this: MirageTestContext, assert) {
    assert.expect(1);

    this.server.post(
      'https://data.naviapp.io',
      (_schema: TODO, { requestHeaders }: { requestHeaders: Record<string, string> }) => {
        assert.equal(requestHeaders.authentication, 'Bearer abc-123', 'fetchById sends custom headers');
        return [];
      }
    );
    await Adapter.fetchById('table', 'foo', {
      customHeaders: {
        Authentication: 'Bearer abc-123',
      },
    });
  });

  test('fetchAll - response', async function (this: MirageTestContext, assert) {
    assert.expect(8);

    // Seed our mirage database
    ElideOneScenario(this.server);

    const expectedFields = [
      'id',
      'name',
      'friendlyName',
      'description',
      'category',
      'cardinality',
      'isFact',
      'namespace',
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

    // Tables namespace
    [0, 1].forEach((i) => {
      assert.deepEqual(
        tables[i].namespace,
        {
          __typename: 'ElideNamespaceConnection',
          edges: [
            {
              __typename: 'ElideNamespaceEdge',
              node: {
                id: 'default',
                name: 'default',
                friendlyName: 'default',
                description: 'Default Namespace',
                __typename: 'ElideNamespace',
              },
            },
          ],
        },
        `namespace of table ${i} is returned`
      );
    });

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
              cardinality: 'UNKNOWN',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 0',
              expression: null,
              id: 'table0.dimension0',
              name: 'dimension0',
              friendlyName: 'Dimension 0',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [],
              },
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
              cardinality: 'TINY',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 1',
              expression: null,
              id: 'table0.dimension1',
              name: 'dimension1',
              friendlyName: 'Dimension 1',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [],
              },
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
              cardinality: 'SMALL',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 2',
              expression: null,
              id: 'table0.dimension2',
              name: 'dimension2',
              friendlyName: 'Dimension 2',
              tags: ['DISPLAY'],
              valueSourceType: 'TABLE',
              valueType: 'TEXT',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [
                  {
                    __typename: 'TableSourceEdge',
                    node: {
                      __typename: 'TableSource',
                      suggestionColumns: {
                        __typename: 'DimensionConnection',
                        edges: [],
                      },
                      valueSource: {
                        __typename: 'DimensionConnection',
                        edges: [
                          {
                            __typename: 'DimensionEdge',
                            node: {
                              __typename: 'Dimension',
                              id: 'table0.dimension0',
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
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

  test('fetchAll - response - with namespace', async function (this: MirageTestContext, assert) {
    assert.expect(8);

    // Seed our mirage database
    ElideWithNamespaceScenario(this.server);

    const expectedFields = [
      'id',
      'name',
      'friendlyName',
      'description',
      'category',
      'cardinality',
      'isFact',
      'namespace',
      'metrics',
      'dimensions',
      'timeDimensions',
      '__typename',
    ];

    const { table: tableConnection } = await Adapter.fetchAll('table', {
      dataSourceName: 'elideWithNamespace',
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

    // Tables namespace
    [0, 1].forEach((i) => {
      assert.deepEqual(
        tables[i].namespace,
        {
          __typename: 'ElideNamespaceConnection',
          edges: [
            {
              __typename: 'ElideNamespaceEdge',
              node: {
                id: 'DemoNamespace',
                name: 'DemoNamespace',
                friendlyName: 'Demo Namespace',
                description: 'Demo Namespace',
                __typename: 'ElideNamespace',
              },
            },
          ],
        },
        `namespace of table ${i} is returned`
      );
    });

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
              cardinality: 'UNKNOWN',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 0',
              expression: null,
              id: 'table0.dimension0',
              name: 'dimension0',
              friendlyName: 'Dimension 0',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [],
              },
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
              cardinality: 'TINY',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 1',
              expression: null,
              id: 'table0.dimension1',
              name: 'dimension1',
              friendlyName: 'Dimension 1',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [],
              },
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
              id: 'table1.metric1',
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
              id: 'table1.metric2',
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
      'Metrics for the second table are included when requested'
    );

    assert.deepEqual(
      tables[1].dimensions,
      {
        __typename: 'DimensionConnection',
        edges: [
          {
            __typename: 'DimensionEdge',
            node: {
              __typename: 'Dimension',
              cardinality: 'SMALL',
              category: 'categoryOne',
              columnType: 'field',
              description: 'This is dimension 2',
              expression: null,
              id: 'table1.dimension2',
              name: 'dimension2',
              friendlyName: 'Dimension 2',
              tableSource: {
                __typename: 'TableSourceConnection',
                edges: [
                  {
                    __typename: 'TableSourceEdge',
                    node: {
                      __typename: 'TableSource',
                      suggestionColumns: {
                        __typename: 'DimensionConnection',
                        edges: [],
                      },
                      valueSource: {
                        __typename: 'DimensionConnection',
                        edges: [
                          {
                            __typename: 'DimensionEdge',
                            node: {
                              __typename: 'Dimension',
                              id: 'table0.dimension0',
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
              tags: ['DISPLAY'],
              valueSourceType: 'TABLE',
              valueType: 'TEXT',
              values: [],
            },
          },
        ],
      },
      'All dimensions and the requested fields are returned for table 1'
    );
  });

  test('fetchById - response', async function (this: MirageTestContext, assert) {
    assert.expect(1);

    // Seed our mirage database
    ElideOneScenario(this.server);

    const result = await Adapter.fetchById('table', 'table0', {
      dataSourceName: 'elideOne',
    });

    assert.deepEqual(
      result,
      {
        table: {
          __typename: 'ElideTableConnection',
          edges: [
            {
              __typename: 'ElideTableEdge',
              node: {
                id: 'table0',
                name: 'table0',
                friendlyName: 'Table 0',
                description: 'This is Table 0',
                category: 'categoryOne',
                cardinality: 'SMALL',
                isFact: true,
                namespace: {
                  __typename: 'ElideNamespaceConnection',
                  edges: [
                    {
                      __typename: 'ElideNamespaceEdge',
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                        __typename: 'ElideNamespace',
                      },
                    },
                  ],
                },
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
                        cardinality: 'UNKNOWN',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 0',
                        expression: null,
                        id: 'table0.dimension0',
                        name: 'dimension0',
                        friendlyName: 'Dimension 0',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [],
                        },
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
                        cardinality: 'TINY',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 1',
                        expression: null,
                        id: 'table0.dimension1',
                        name: 'dimension1',
                        friendlyName: 'Dimension 1',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [],
                        },
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
                        cardinality: 'SMALL',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 2',
                        expression: null,
                        id: 'table0.dimension2',
                        name: 'dimension2',
                        friendlyName: 'Dimension 2',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [
                            {
                              __typename: 'TableSourceEdge',
                              node: {
                                __typename: 'TableSource',
                                suggestionColumns: {
                                  __typename: 'DimensionConnection',
                                  edges: [],
                                },
                                valueSource: {
                                  __typename: 'DimensionConnection',
                                  edges: [
                                    {
                                      __typename: 'DimensionEdge',
                                      node: {
                                        __typename: 'Dimension',
                                        id: 'table0.dimension0',
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
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
                __typename: 'ElideTable',
              },
            },
          ],
        },
      },
      'The expected table is returned with all requested fields'
    );
  });

  test('fetchById - response - with namespace', async function (this: MirageTestContext, assert) {
    assert.expect(1);

    // Seed our mirage database
    ElideOneScenario(this.server);

    const result = await Adapter.fetchById('table', 'table0', {
      dataSourceName: 'elideOne',
    });

    assert.deepEqual(
      result,
      {
        table: {
          __typename: 'ElideTableConnection',
          edges: [
            {
              __typename: 'ElideTableEdge',
              node: {
                id: 'table0',
                name: 'table0',
                friendlyName: 'Table 0',
                description: 'This is Table 0',
                category: 'categoryOne',
                cardinality: 'SMALL',
                isFact: true,
                namespace: {
                  __typename: 'ElideNamespaceConnection',
                  edges: [
                    {
                      __typename: 'ElideNamespaceEdge',
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                        __typename: 'ElideNamespace',
                      },
                    },
                  ],
                },
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
                        cardinality: 'UNKNOWN',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 0',
                        expression: null,
                        id: 'table0.dimension0',
                        name: 'dimension0',
                        friendlyName: 'Dimension 0',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [],
                        },
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
                        cardinality: 'TINY',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 1',
                        expression: null,
                        id: 'table0.dimension1',
                        name: 'dimension1',
                        friendlyName: 'Dimension 1',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [],
                        },
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
                        cardinality: 'SMALL',
                        category: 'categoryOne',
                        columnType: 'field',
                        description: 'This is dimension 2',
                        expression: null,
                        id: 'table0.dimension2',
                        name: 'dimension2',
                        friendlyName: 'Dimension 2',
                        tableSource: {
                          __typename: 'TableSourceConnection',
                          edges: [
                            {
                              __typename: 'TableSourceEdge',
                              node: {
                                __typename: 'TableSource',
                                suggestionColumns: {
                                  __typename: 'DimensionConnection',
                                  edges: [],
                                },
                                valueSource: {
                                  __typename: 'DimensionConnection',
                                  edges: [
                                    {
                                      __typename: 'DimensionEdge',
                                      node: {
                                        __typename: 'Dimension',
                                        id: 'table0.dimension0',
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
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
                __typename: 'ElideTable',
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
