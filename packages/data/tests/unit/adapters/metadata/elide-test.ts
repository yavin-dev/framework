import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import * as GQLQueries from '@yavin/client/gql/metadata-queries';
import { print } from 'graphql/language/printer';
import ElideOneScenario from 'navi-data/mirage/scenarios/elide-one';
import ElideOneDemoNamespaceScenario from 'navi-data/mirage/scenarios/elide-one-demo-namespace';
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
    await Adapter.fetchAll('table', { dataSourceName: 'elideOne.DemoNamespace' });
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
    await Adapter.fetchById('table', 'foo', { dataSourceName: 'elideOne.DemoNamespace' });
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
        __typename: 'ElideMetricConnection',
        edges: [
          {
            node: {
              id: 'table0.metric0',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric0',
              friendlyName: 'Metric 0',
              description: 'This is metric 0',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
          {
            node: {
              id: 'table0.metric1',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric1',
              friendlyName: 'Metric 1',
              description: 'This is metric 1',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
          {
            node: {
              id: 'table0.metric2',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric2',
              friendlyName: 'Metric 2',
              description: 'This is metric 2',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
        ],
      },
      'The expected metrics are returned when querying table 0'
    );

    assert.deepEqual(
      tables[0].dimensions,
      {
        edges: [
          {
            node: {
              id: 'table0.dimension0',
              name: 'dimension0',
              friendlyName: 'Dimension 0',
              description: 'This is dimension 0',
              cardinality: 'UNKNOWN',
              category: 'categoryOne',
              valueType: 'TEXT',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              valueSourceType: 'NONE',
              tableSource: {
                edges: [],
                __typename: 'ElideTableSourceConnection',
              },
              values: [],
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              __typename: 'ElideDimension',
            },
            __typename: 'ElideDimensionEdge',
          },
          {
            node: {
              id: 'table0.dimension1',
              name: 'dimension1',
              friendlyName: 'Dimension 1',
              description: 'This is dimension 1',
              cardinality: 'TINY',
              category: 'categoryOne',
              valueType: 'TEXT',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              valueSourceType: 'ENUM',
              tableSource: {
                edges: [],
                __typename: 'ElideTableSourceConnection',
              },
              values: [
                'Practical Frozen Fish (enum)',
                'Practical Concrete Chair (enum)',
                'Awesome Steel Chicken (enum)',
                'Tasty Fresh Towels (enum)',
                'Intelligent Steel Pizza (enum)',
              ],
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              __typename: 'ElideDimension',
            },
            __typename: 'ElideDimensionEdge',
          },
          {
            node: {
              id: 'table0.dimension2',
              name: 'dimension2',
              friendlyName: 'Dimension 2',
              description: 'This is dimension 2',
              cardinality: 'SMALL',
              category: 'categoryOne',
              valueType: 'TEXT',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              valueSourceType: 'TABLE',
              tableSource: {
                edges: [
                  {
                    node: {
                      suggestionColumns: {
                        edges: [],
                        __typename: 'ElideColumnConnection',
                      },
                      valueSource: {
                        edges: [
                          {
                            node: {
                              id: 'table0.dimension0',
                              __typename: 'ElideColumn',
                            },
                            __typename: 'ElideColumnEdge',
                          },
                        ],
                        __typename: 'ElideColumnConnection',
                      },
                      __typename: 'ElideTableSource',
                    },
                    __typename: 'ElideTableSourceEdge',
                  },
                ],
                __typename: 'ElideTableSourceConnection',
              },
              values: [],
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              __typename: 'ElideDimension',
            },
            __typename: 'ElideDimensionEdge',
          },
        ],
        __typename: 'ElideDimensionConnection',
      },
      'All dimensions and the requested fields are returned for table 0'
    );

    // Second Table metrics and dimensions
    assert.deepEqual(
      tables[1].metrics,
      {
        __typename: 'ElideMetricConnection',
        edges: [
          {
            node: {
              id: 'table1.metric3',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric3',
              friendlyName: 'Metric 3',
              description: 'This is metric 3',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
          {
            node: {
              id: 'table1.metric4',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric4',
              friendlyName: 'Metric 4',
              description: 'This is metric 4',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
        ],
      },
      'Metrics for the second table are included when requested'
    );

    assert.deepEqual(
      tables[1].dimensions,
      {
        edges: [],
        __typename: 'ElideDimensionConnection',
      },
      'Table with no dimensions returns an empty edges array for dimensions'
    );
  });

  test('fetchAll - response - demo namespace', async function (this: MirageTestContext, assert) {
    // Seed our mirage database
    ElideOneDemoNamespaceScenario(this.server);

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
      dataSourceName: 'elideOne.DemoNamespace',
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
        __typename: 'ElideMetricConnection',
        edges: [
          {
            node: {
              id: 'table0.metric0',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric0',
              friendlyName: 'Metric 0',
              description: 'This is metric 0',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
        ],
      },
      'The expected metrics are returned when querying table 0'
    );

    assert.deepEqual(
      tables[0].dimensions,
      {
        __typename: 'ElideDimensionConnection',
        edges: [
          {
            __typename: 'ElideDimensionEdge',
            node: {
              __typename: 'ElideDimension',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              cardinality: 'UNKNOWN',
              category: 'categoryOne',
              columnType: 'FIELD',
              description: 'This is dimension 0',
              expression: null,
              id: 'table0.dimension0',
              name: 'dimension0',
              friendlyName: 'Dimension 0',
              tableSource: {
                __typename: 'ElideTableSourceConnection',
                edges: [],
              },
              tags: ['DISPLAY'],
              valueSourceType: 'NONE',
              valueType: 'TEXT',
              values: [],
            },
          },
          {
            __typename: 'ElideDimensionEdge',
            node: {
              __typename: 'ElideDimension',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              cardinality: 'TINY',
              category: 'categoryOne',
              columnType: 'FIELD',
              description: 'This is dimension 1',
              expression: null,
              id: 'table0.dimension1',
              name: 'dimension1',
              friendlyName: 'Dimension 1',
              tableSource: {
                __typename: 'ElideTableSourceConnection',
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
        __typename: 'ElideMetricConnection',
        edges: [
          {
            node: {
              id: 'table1.metric1',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric1',
              friendlyName: 'Metric 1',
              description: 'This is metric 1',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
          {
            node: {
              id: 'table1.metric2',
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              name: 'metric2',
              friendlyName: 'Metric 2',
              description: 'This is metric 2',
              category: 'categoryOne',
              valueType: 'INTEGER',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              __typename: 'ElideMetric',
            },
            __typename: 'ElideMetricEdge',
          },
        ],
      },
      'Metrics for the second table are included when requested'
    );

    assert.deepEqual(
      tables[1].dimensions,
      {
        edges: [
          {
            node: {
              id: 'table1.dimension2',
              name: 'dimension2',
              friendlyName: 'Dimension 2',
              description: 'This is dimension 2',
              cardinality: 'SMALL',
              category: 'categoryOne',
              valueType: 'TEXT',
              tags: ['DISPLAY'],
              columnType: 'FIELD',
              expression: null,
              valueSourceType: 'TABLE',
              tableSource: {
                edges: [
                  {
                    node: {
                      suggestionColumns: {
                        edges: [],
                        __typename: 'ElideColumnConnection',
                      },
                      valueSource: {
                        edges: [
                          {
                            node: {
                              id: 'table0.dimension0',
                              __typename: 'ElideColumn',
                            },
                            __typename: 'ElideColumnEdge',
                          },
                        ],
                        __typename: 'ElideColumnConnection',
                      },
                      __typename: 'ElideTableSource',
                    },
                    __typename: 'ElideTableSourceEdge',
                  },
                ],
                __typename: 'ElideTableSourceConnection',
              },
              values: [],
              arguments: {
                edges: [],
                __typename: 'ElideArgumentConnection',
              },
              __typename: 'ElideDimension',
            },
            __typename: 'ElideDimensionEdge',
          },
        ],
        __typename: 'ElideDimensionConnection',
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
          edges: [
            {
              node: {
                id: 'table0',
                name: 'table0',
                friendlyName: 'Table 0',
                description: 'This is Table 0',
                category: 'categoryOne',
                cardinality: 'SMALL',
                isFact: true,
                namespace: {
                  edges: [
                    {
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                        __typename: 'ElideNamespace',
                      },
                      __typename: 'ElideNamespaceEdge',
                    },
                  ],
                  __typename: 'ElideNamespaceConnection',
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
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric1',
                        name: 'metric1',
                        friendlyName: 'Metric 1',
                        description: 'This is metric 1',
                        category: 'categoryOne',
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric2',
                        name: 'metric2',
                        friendlyName: 'Metric 2',
                        description: 'This is metric 2',
                        category: 'categoryOne',
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                  ],
                  __typename: 'ElideMetricConnection',
                },
                dimensions: {
                  edges: [
                    {
                      node: {
                        id: 'table0.dimension0',
                        name: 'dimension0',
                        friendlyName: 'Dimension 0',
                        description: 'This is dimension 0',
                        cardinality: 'UNKNOWN',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'NONE',
                        tableSource: {
                          edges: [],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                    {
                      node: {
                        id: 'table0.dimension1',
                        name: 'dimension1',
                        friendlyName: 'Dimension 1',
                        description: 'This is dimension 1',
                        cardinality: 'TINY',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'ENUM',
                        tableSource: {
                          edges: [],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [
                          'Practical Frozen Fish (enum)',
                          'Practical Concrete Chair (enum)',
                          'Awesome Steel Chicken (enum)',
                          'Tasty Fresh Towels (enum)',
                          'Intelligent Steel Pizza (enum)',
                        ],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                    {
                      node: {
                        id: 'table0.dimension2',
                        name: 'dimension2',
                        friendlyName: 'Dimension 2',
                        description: 'This is dimension 2',
                        cardinality: 'SMALL',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'TABLE',
                        tableSource: {
                          edges: [
                            {
                              node: {
                                suggestionColumns: {
                                  edges: [],
                                  __typename: 'ElideColumnConnection',
                                },
                                valueSource: {
                                  edges: [
                                    {
                                      node: {
                                        id: 'table0.dimension0',
                                        __typename: 'ElideColumn',
                                      },
                                      __typename: 'ElideColumnEdge',
                                    },
                                  ],
                                  __typename: 'ElideColumnConnection',
                                },
                                __typename: 'ElideTableSource',
                              },
                              __typename: 'ElideTableSourceEdge',
                            },
                          ],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                  ],
                  __typename: 'ElideDimensionConnection',
                },
                timeDimensions: {
                  edges: [],
                  __typename: 'ElideTimeDimensionConnection',
                },
                __typename: 'ElideTable',
              },
              __typename: 'ElideTableEdge',
            },
          ],
          __typename: 'ElideTableConnection',
        },
      },
      'The expected table is returned with all requested fields'
    );
  });

  test('fetchById - response - demo namespace', async function (this: MirageTestContext, assert) {
    // Seed our mirage database
    ElideOneScenario(this.server);

    const result = await Adapter.fetchById('table', 'table0', {
      dataSourceName: 'elideOne',
    });
    assert.deepEqual(
      result,
      {
        table: {
          edges: [
            {
              node: {
                id: 'table0',
                name: 'table0',
                friendlyName: 'Table 0',
                description: 'This is Table 0',
                category: 'categoryOne',
                cardinality: 'SMALL',
                isFact: true,
                namespace: {
                  edges: [
                    {
                      node: {
                        id: 'default',
                        name: 'default',
                        friendlyName: 'default',
                        description: 'Default Namespace',
                        __typename: 'ElideNamespace',
                      },
                      __typename: 'ElideNamespaceEdge',
                    },
                  ],
                  __typename: 'ElideNamespaceConnection',
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
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric1',
                        name: 'metric1',
                        friendlyName: 'Metric 1',
                        description: 'This is metric 1',
                        category: 'categoryOne',
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                    {
                      node: {
                        id: 'table0.metric2',
                        name: 'metric2',
                        friendlyName: 'Metric 2',
                        description: 'This is metric 2',
                        category: 'categoryOne',
                        valueType: 'INTEGER',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideMetric',
                      },
                      __typename: 'ElideMetricEdge',
                    },
                  ],
                  __typename: 'ElideMetricConnection',
                },
                dimensions: {
                  edges: [
                    {
                      node: {
                        id: 'table0.dimension0',
                        name: 'dimension0',
                        friendlyName: 'Dimension 0',
                        description: 'This is dimension 0',
                        cardinality: 'UNKNOWN',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'NONE',
                        tableSource: {
                          edges: [],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                    {
                      node: {
                        id: 'table0.dimension1',
                        name: 'dimension1',
                        friendlyName: 'Dimension 1',
                        description: 'This is dimension 1',
                        cardinality: 'TINY',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'ENUM',
                        tableSource: {
                          edges: [],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [
                          'Practical Frozen Fish (enum)',
                          'Practical Concrete Chair (enum)',
                          'Awesome Steel Chicken (enum)',
                          'Tasty Fresh Towels (enum)',
                          'Intelligent Steel Pizza (enum)',
                        ],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                    {
                      node: {
                        id: 'table0.dimension2',
                        name: 'dimension2',
                        friendlyName: 'Dimension 2',
                        description: 'This is dimension 2',
                        cardinality: 'SMALL',
                        category: 'categoryOne',
                        valueType: 'TEXT',
                        tags: ['DISPLAY'],
                        columnType: 'FIELD',
                        expression: null,
                        valueSourceType: 'TABLE',
                        tableSource: {
                          edges: [
                            {
                              node: {
                                suggestionColumns: {
                                  edges: [],
                                  __typename: 'ElideColumnConnection',
                                },
                                valueSource: {
                                  edges: [
                                    {
                                      node: {
                                        id: 'table0.dimension0',
                                        __typename: 'ElideColumn',
                                      },
                                      __typename: 'ElideColumnEdge',
                                    },
                                  ],
                                  __typename: 'ElideColumnConnection',
                                },
                                __typename: 'ElideTableSource',
                              },
                              __typename: 'ElideTableSourceEdge',
                            },
                          ],
                          __typename: 'ElideTableSourceConnection',
                        },
                        values: [],
                        arguments: {
                          edges: [],
                          __typename: 'ElideArgumentConnection',
                        },
                        __typename: 'ElideDimension',
                      },
                      __typename: 'ElideDimensionEdge',
                    },
                  ],
                  __typename: 'ElideDimensionConnection',
                },
                timeDimensions: {
                  edges: [],
                  __typename: 'ElideTimeDimensionConnection',
                },
                __typename: 'ElideTable',
              },
              __typename: 'ElideTableEdge',
            },
          ],
          __typename: 'ElideTableConnection',
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
