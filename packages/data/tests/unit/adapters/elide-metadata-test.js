import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import GQLQueries from 'navi-data/gql/metadata-queries';
import { print } from 'graphql/language/printer';
import scenario from 'dummy/mirage/scenarios/graphql';

// Apollo includes this field in its queries, but we don't want to compare against that in our tests
const removeTypeNameField = query => query.replace(/\n\s*__typename/g, '').trim();

module('Unit | Elide Metadata Adapter', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  let Adapter;

  hooks.beforeEach(function() {
    Adapter = this.owner.lookup('adapter:elide-metadata');
  });

  /*
   * Test whether the url path is built correctly
   */
  test('fetchAll - request format', async function(assert) {
    assert.expect(3);

    const gqlQuery = print(GQLQueries.table.all).trim(); //GQL Query as string

    this.server.post('https://data.naviapp.io/v1/graphql', (schema, { requestBody }) => {
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

  test('fetchMetadata - request format', async function(assert) {
    assert.expect(3);

    const gqlQuery = print(GQLQueries.table.single).trim(); //GQL Query as string

    this.server.post('https://data.naviapp.io/v1/graphql', (schema, { requestBody }) => {
      const { operationName, variables, query } = JSON.parse(requestBody);

      assert.notOk(operationName, 'No operation name specified');
      assert.deepEqual(variables, { id: 'foo' }, 'id variable is passed in options');
      assert.equal(
        removeTypeNameField(query),
        gqlQuery,
        'The appropriate gql query is sent as a post to the graphql endpoint'
      );

      return [];
    });
    await Adapter.fetchMetadata('table', 'foo');
  });

  test('fetchAll', async function(assert) {
    assert.expect(6);

    // Seed our mirage database
    scenario(this.server);

    const expectedFields = [
      'id',
      'name',
      'description',
      'category',
      'cardinality',
      'metrics',
      'dimensions',
      'timeDimensions',
      '__typename'
    ];

    const { tables: tableConnection } = await Adapter.fetchAll('table');
    const tables = tableConnection.edges.map(edge => edge.node);

    // Test that all fields specified in the query are included in the result and none of them are null as they should be populated by the factories
    assert.deepEqual(
      tables.map(Object.keys),
      [expectedFields, expectedFields],
      'Both tables in the mirage database are returned with the expected fields for every table'
    );
    assert.ok(
      tables.every(table => Object.keys(table).every(key => !!table[key])),
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
              id: 'metric0',
              name: 'Metric 0',
              description: 'This is metric 0',
              category: 'categoryOne',
              valueType: 'NUMBER',
              columnTags: ['DISPLAY'],
              defaultFormat: 'number',
              columnType: 'field',
              expression: null,
              __typename: 'Metric'
            },
            __typename: 'MetricEdge'
          },
          {
            node: {
              id: 'metric1',
              name: 'Metric 1',
              description: 'This is metric 1',
              category: 'categoryOne',
              valueType: 'NUMBER',
              columnTags: ['DISPLAY'],
              defaultFormat: 'number',
              columnType: 'field',
              expression: null,
              __typename: 'Metric'
            },
            __typename: 'MetricEdge'
          }
        ]
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
              id: 'dimension0',
              name: 'Dimension 0',
              description: 'This is dimension 0',
              category: 'categoryOne',
              valueType: 'TEXT',
              columnTags: ['DISPLAY'],
              columnType: 'field',
              expression: null,
              __typename: 'Dimension'
            }
          }
        ]
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
              id: 'metric2',
              name: 'Metric 2',
              description: 'This is metric 2',
              category: 'categoryOne',
              valueType: 'NUMBER',
              columnTags: ['DISPLAY'],
              defaultFormat: 'number',
              columnType: 'field',
              expression: null,
              __typename: 'Metric'
            },
            __typename: 'MetricEdge'
          },
          {
            node: {
              id: 'metric3',
              name: 'Metric 3',
              description: 'This is metric 3',
              category: 'categoryOne',
              valueType: 'NUMBER',
              columnTags: ['DISPLAY'],
              defaultFormat: 'number',
              columnType: 'field',
              expression: null,
              __typename: 'Metric'
            },
            __typename: 'MetricEdge'
          }
        ]
      },
      'Metrics for the second table are included when requested'
    );

    assert.deepEqual(
      tables[1].dimensions,
      {
        edges: [],
        __typename: 'DimensionConnection'
      },
      'Table with no dimensions returns an empty edges array for dimensions'
    );
  });

  test('fetchMetadata', async function(assert) {
    assert.expect(1);

    // Seed our mirage database
    scenario(this.server);

    const result = await Adapter.fetchMetadata('table', 'table0');

    assert.deepEqual(
      result,
      {
        table: {
          id: 'table0',
          name: 'Table 0',
          description: 'This is Table 0',
          category: 'categoryOne',
          cardinality: 'SMALL',
          metrics: {
            edges: [
              {
                node: {
                  id: 'metric0',
                  name: 'Metric 0',
                  description: 'This is metric 0',
                  category: 'categoryOne',
                  valueType: 'NUMBER',
                  columnTags: ['DISPLAY'],
                  defaultFormat: 'number',
                  columnType: 'field',
                  expression: null,
                  __typename: 'Metric'
                },
                __typename: 'MetricEdge'
              },
              {
                node: {
                  id: 'metric1',
                  name: 'Metric 1',
                  description: 'This is metric 1',
                  category: 'categoryOne',
                  valueType: 'NUMBER',
                  columnTags: ['DISPLAY'],
                  defaultFormat: 'number',
                  columnType: 'field',
                  expression: null,
                  __typename: 'Metric'
                },
                __typename: 'MetricEdge'
              }
            ],
            __typename: 'MetricConnection'
          },
          dimensions: {
            edges: [
              {
                node: {
                  id: 'dimension0',
                  name: 'Dimension 0',
                  description: 'This is dimension 0',
                  category: 'categoryOne',
                  valueType: 'TEXT',
                  columnTags: ['DISPLAY'],
                  columnType: 'field',
                  expression: null,
                  __typename: 'Dimension'
                },
                __typename: 'DimensionEdge'
              }
            ],
            __typename: 'DimensionConnection'
          },
          timeDimensions: {
            edges: [],
            __typename: 'TimeDimensionConnection'
          },
          __typename: 'Table'
        }
      },
      'The expected table is returned with all requested fields'
    );
  });
});
