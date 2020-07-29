import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ElideMetadataSerializer from 'navi-data/serializers/metadata/elide';
import { TestContext } from 'ember-test-helpers';
import {
  TablePayload,
  MetricNode,
  Connection,
  DimensionNode,
  TimeDimensionNode
} from 'navi-data/serializers/metadata/elide';

let Serializer: ElideMetadataSerializer;

module('Unit | Serializer | metadata/elide', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    Serializer = this.owner.lookup('serializer:metadata/elide');
  });

  test('normalize', function(assert) {
    const tableConnectionPayload: TablePayload = {
      table: {
        edges: [
          {
            node: {
              id: 'tableA',
              name: 'Table A',
              description: 'Table A',
              category: 'cat1',
              cardinality: 'SMALL',
              metrics: {
                edges: [
                  {
                    node: {
                      id: 'tableA.m1',
                      name: 'M1',
                      description: 'Table A Metric 1',
                      category: 'cat1',
                      valueType: 'NUMBER',
                      columnTags: ['IMPORTANT'],
                      defaultFormat: 'NONE',
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  }
                ],
                pageInfo: []
              },
              dimensions: {
                edges: [
                  {
                    node: {
                      id: 'tableA.d1',
                      name: 'D1',
                      description: 'Table A Dimension 1',
                      category: 'cat1',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT'],
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  },
                  {
                    node: {
                      id: 'tableA.d2',
                      name: 'D2',
                      description: 'Table A Dimension 2',
                      category: 'cat1',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT'],
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  }
                ],
                pageInfo: {}
              },
              timeDimensions: {
                edges: [
                  {
                    node: {
                      id: 'tableA.td1',
                      name: 'TD1',
                      description: 'Table A Time Dimension 1',
                      category: 'cat1',
                      valueType: 'DATE',
                      columnTags: ['IMPORTANT'],
                      supportedGrains: {
                        edges: [
                          { node: { id: 'day', grain: 'DAY', expression: '' }, cursor: '' },
                          { node: { id: 'week', grain: 'WEEK', expression: '' }, cursor: '' }
                        ],
                        pageInfo: {}
                      },
                      timeZone: 'UTC',
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  }
                ],
                pageInfo: {}
              }
            },
            cursor: ''
          },
          {
            node: {
              id: 'tableB',
              name: 'Table B',
              description: 'Table B',
              category: 'cat2',
              cardinality: 'MEDIUM',
              metrics: {
                edges: [
                  {
                    node: {
                      id: 'tableB.m2',
                      name: 'M2',
                      description: 'Table B Metric 2',
                      category: 'cat2',
                      valueType: 'NUMBER',
                      columnTags: ['IMPORTANT'],
                      defaultFormat: 'NONE',
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  },
                  {
                    node: {
                      id: 'tableB.m3',
                      name: 'M3',
                      description: 'Table B Metric 3',
                      category: 'cat2',
                      valueType: 'NUMBER',
                      columnTags: ['IMPORTANT'],
                      defaultFormat: 'NONE',
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  }
                ],
                pageInfo: {}
              },
              dimensions: {
                edges: [
                  {
                    node: {
                      id: 'tableB.d1',
                      name: 'D1',
                      description: 'Table B Dimension 1',
                      category: 'cat2',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT'],
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  },
                  {
                    node: {
                      id: 'tableB.d2',
                      name: 'D2',
                      description: 'Table B Dimension 2',
                      category: 'cat2',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT'],
                      columnType: 'field',
                      expression: ''
                    },
                    cursor: ''
                  }
                ],
                pageInfo: {}
              },
              timeDimensions: {
                edges: [],
                pageInfo: {}
              }
            },
            cursor: ''
          }
        ],
        pageInfo: {}
      },
      source: 'dummy'
    };

    assert.deepEqual(
      Serializer.normalize('everything', tableConnectionPayload),
      {
        tables: [
          {
            id: 'tableA',
            name: 'Table A',
            description: 'Table A',
            category: 'cat1',
            cardinality: 'SMALL',
            metricIds: ['tableA.m1'],
            dimensionIds: ['tableA.d1', 'tableA.d2'],
            timeDimensionIds: ['tableA.td1'],
            source: 'dummy'
          },
          {
            id: 'tableB',
            name: 'Table B',
            description: 'Table B',
            category: 'cat2',
            cardinality: 'MEDIUM',
            metricIds: ['tableB.m2', 'tableB.m3'],
            dimensionIds: ['tableB.d1', 'tableB.d2'],
            timeDimensionIds: [],
            source: 'dummy'
          }
        ],
        metrics: [
          {
            id: 'tableA.m1',
            name: 'M1',
            description: 'Table A Metric 1',
            category: 'cat1',
            valueType: 'NUMBER',
            tags: ['IMPORTANT'],
            defaultFormat: 'NONE',
            type: 'field',
            expression: '',
            source: 'dummy',
            tableId: 'tableA'
          },
          {
            id: 'tableB.m2',
            name: 'M2',
            description: 'Table B Metric 2',
            category: 'cat2',
            valueType: 'NUMBER',
            tags: ['IMPORTANT'],
            defaultFormat: 'NONE',
            type: 'field',
            expression: '',
            tableId: 'tableB',
            source: 'dummy'
          },
          {
            id: 'tableB.m3',
            name: 'M3',
            description: 'Table B Metric 3',
            category: 'cat2',
            valueType: 'NUMBER',
            tags: ['IMPORTANT'],
            defaultFormat: 'NONE',
            type: 'field',
            expression: '',
            tableId: 'tableB',
            source: 'dummy'
          }
        ],
        dimensions: [
          {
            id: 'tableA.d1',
            name: 'D1',
            description: 'Table A Dimension 1',
            category: 'cat1',
            valueType: 'TEXT',
            tags: ['IMPORTANT'],
            type: 'field',
            expression: '',
            source: 'dummy',
            tableId: 'tableA'
          },
          {
            id: 'tableA.d2',
            name: 'D2',
            description: 'Table A Dimension 2',
            category: 'cat1',
            valueType: 'TEXT',
            tags: ['IMPORTANT'],
            type: 'field',
            expression: '',
            source: 'dummy',
            tableId: 'tableA'
          },
          {
            id: 'tableB.d1',
            name: 'D1',
            description: 'Table B Dimension 1',
            category: 'cat2',
            valueType: 'TEXT',
            tags: ['IMPORTANT'],
            type: 'field',
            expression: '',
            source: 'dummy',
            tableId: 'tableB'
          },
          {
            id: 'tableB.d2',
            name: 'D2',
            description: 'Table B Dimension 2',
            category: 'cat2',
            valueType: 'TEXT',
            tags: ['IMPORTANT'],
            type: 'field',
            expression: '',
            source: 'dummy',
            tableId: 'tableB'
          }
        ],
        timeDimensions: [
          {
            id: 'tableA.td1',
            name: 'TD1',
            description: 'Table A Time Dimension 1',
            category: 'cat1',
            valueType: 'DATE',
            tags: ['IMPORTANT'],
            type: 'field',
            expression: '',
            supportedGrains: [
              { id: 'day', grain: 'DAY', expression: '' },
              { id: 'week', grain: 'WEEK', expression: '' }
            ],
            timeZone: 'UTC',
            source: 'dummy',
            tableId: 'tableA'
          }
        ]
      },
      'Normalizes typical tables response correctly'
    );
  });

  test('_normalizeTableMetrics', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const metricConnectionPayload: Connection<MetricNode> = {
      edges: [
        {
          node: {
            id: 'clicks',
            name: 'Clicks',
            description: 'Clicks',
            category: 'userMetrics',
            valueType: 'NUMBER',
            columnTags: ['IMPORTANT'],
            defaultFormat: 'NONE',
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        },
        {
          node: {
            id: 'impressions',
            name: 'Impressions',
            description: 'Impressions',
            category: 'userMetrics',
            valueType: 'NUMBER',
            columnTags: ['DISPLAY'],
            defaultFormat: 'NONE',
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        }
      ],
      pageInfo: {}
    };

    assert.deepEqual(
      Serializer._normalizeTableMetrics(metricConnectionPayload, tableId, source),
      [
        {
          id: 'clicks',
          name: 'Clicks',
          description: 'Clicks',
          category: 'userMetrics',
          valueType: 'NUMBER',
          tags: ['IMPORTANT'],
          defaultFormat: 'NONE',
          source,
          tableId,
          type: 'field',
          expression: ''
        },
        {
          id: 'impressions',
          name: 'Impressions',
          description: 'Impressions',
          category: 'userMetrics',
          valueType: 'NUMBER',
          tags: ['DISPLAY'],
          defaultFormat: 'NONE',
          source,
          tableId,
          type: 'field',
          expression: ''
        }
      ],
      'Metric connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableMetrics({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableDimensions', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const dimensionConnectionPayload: Connection<DimensionNode> = {
      edges: [
        {
          node: {
            id: 'age',
            name: 'Age',
            description: 'User Age',
            category: 'userDimensions',
            valueType: 'TEXT',
            columnTags: ['IMPORTANT'],
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        },
        {
          node: {
            id: 'gender',
            name: 'Gender',
            description: 'User Gender',
            category: 'userDimensions',
            valueType: 'TEXT',
            columnTags: ['DISPLAY'],
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        }
      ],
      pageInfo: []
    };

    assert.deepEqual(
      Serializer._normalizeTableDimensions(dimensionConnectionPayload, tableId, source),
      [
        {
          id: 'age',
          name: 'Age',
          description: 'User Age',
          category: 'userDimensions',
          valueType: 'TEXT',
          tags: ['IMPORTANT'],
          source,
          tableId,
          type: 'field',
          expression: ''
        },
        {
          id: 'gender',
          name: 'Gender',
          description: 'User Gender',
          category: 'userDimensions',
          valueType: 'TEXT',
          tags: ['DISPLAY'],
          source,
          tableId,
          type: 'field',
          expression: ''
        }
      ],
      'Dimension connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableDimensions({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableTimeDimensions', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const timeDimensionPayload: Connection<TimeDimensionNode> = {
      edges: [
        {
          node: {
            id: 'userSignupDate',
            name: 'User Signup Date',
            description: 'Date that the user signed up',
            category: 'userDimensions',
            valueType: 'DATE',
            columnTags: ['DISPLAY'],
            supportedGrains: {
              edges: [
                { node: { id: 'day', grain: 'DAY', expression: '' }, cursor: '' },
                { node: { id: 'week', grain: 'WEEK', expression: '' }, cursor: '' },
                { node: { id: 'month', grain: 'MONTH', expression: '' }, cursor: '' }
              ],
              pageInfo: {}
            },
            timeZone: 'PST',
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        },
        {
          node: {
            id: 'orderMonth',
            name: 'Order Month',
            description: 'Month an order was placed',
            category: 'userDimensions',
            valueType: 'DATE',
            columnTags: ['DISPLAY'],
            supportedGrains: {
              edges: [{ node: { id: 'month', grain: 'MONTH', expression: '' }, cursor: '' }],
              pageInfo: []
            },
            timeZone: 'CST',
            columnType: 'field',
            expression: ''
          },
          cursor: ''
        }
      ],
      pageInfo: {}
    };

    assert.deepEqual(
      Serializer._normalizeTableTimeDimensions(timeDimensionPayload, tableId, source),
      [
        {
          id: 'userSignupDate',
          name: 'User Signup Date',
          description: 'Date that the user signed up',
          category: 'userDimensions',
          valueType: 'DATE',
          tags: ['DISPLAY'],
          supportedGrains: [
            { id: 'day', grain: 'DAY', expression: '' },
            { id: 'week', grain: 'WEEK', expression: '' },
            { id: 'month', grain: 'MONTH', expression: '' }
          ],
          timeZone: 'PST',
          source,
          tableId,
          type: 'field',
          expression: ''
        },
        {
          id: 'orderMonth',
          name: 'Order Month',
          description: 'Month an order was placed',
          category: 'userDimensions',
          valueType: 'DATE',
          tags: ['DISPLAY'],
          supportedGrains: [{ id: 'month', grain: 'MONTH', expression: '' }],
          timeZone: 'CST',
          source,
          tableId,
          type: 'field',
          expression: ''
        }
      ],
      'Time Dimension connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableTimeDimensions({ edges: [], pageInfo: {} }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });
});
