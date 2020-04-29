import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

let Serializer;

module('Unit | Serializer | elide-metadata', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:elide-metadata');
  });

  test('normalize', function(assert) {
    const tableConnectionPayload = {
      tables: {
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
                      defaultFormat: 'NONE'
                    }
                  }
                ]
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
                      columnTags: ['IMPORTANT']
                    }
                  },
                  {
                    node: {
                      id: 'tableA.d2',
                      name: 'D2',
                      description: 'Table A Dimension 2',
                      category: 'cat1',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT']
                    }
                  }
                ]
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
                      supportedGrains: ['day', 'week'],
                      timeZone: 'UTC'
                    }
                  }
                ]
              }
            }
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
                      defaultFormat: 'NONE'
                    }
                  },
                  {
                    node: {
                      id: 'tableB.m3',
                      name: 'M3',
                      description: 'Table B Metric 3',
                      category: 'cat2',
                      valueType: 'NUMBER',
                      columnTags: ['IMPORTANT'],
                      defaultFormat: 'NONE'
                    }
                  }
                ]
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
                      columnTags: ['IMPORTANT']
                    }
                  },
                  {
                    node: {
                      id: 'tableB.d2',
                      name: 'D2',
                      description: 'Table B Dimension 2',
                      category: 'cat2',
                      valueType: 'TEXT',
                      columnTags: ['IMPORTANT']
                    }
                  }
                ]
              },
              timeDimensions: {
                edges: []
              }
            }
          }
        ]
      },
      source: 'dummy'
    };

    assert.deepEqual(
      Serializer.normalize(tableConnectionPayload),
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
            supportedGrains: ['day', 'week'],
            timeZone: 'UTC',
            source: 'dummy',
            tableId: 'tableA'
          }
        ]
      },
      'Normalizes typical tables response correctly'
    );

    const nonTablePayload = { foo: 'bar' };

    assert.equal(
      Serializer.normalize(nonTablePayload),
      nonTablePayload,
      'A payload without a tables key is passed through the normalize function'
    );
  });

  test('_normalizeTableMetrics', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const metricConnectionPayload = {
      edges: [
        {
          node: {
            id: 'clicks',
            name: 'Clicks',
            description: 'Clicks',
            category: 'userMetrics',
            valueType: 'NUMBER',
            columnTags: ['IMPORTANT'],
            defaultFormat: 'NONE'
          }
        },
        {
          node: {
            id: 'impressions',
            name: 'Impressions',
            description: 'Impressions',
            category: 'userMetrics',
            valueType: 'NUMBER',
            columnTags: ['DISPLAY'],
            defaultFormat: 'NONE'
          }
        }
      ]
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
          tableId
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
          tableId
        }
      ],
      'Metric connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableMetrics({ edges: [] }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableDimensions', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const dimensionConnectionPayload = {
      edges: [
        {
          node: {
            id: 'age',
            name: 'Age',
            description: 'User Age',
            category: 'userDimensions',
            valueType: 'TEXT',
            columnTags: ['IMPORTANT']
          }
        },
        {
          node: {
            id: 'gender',
            name: 'Gender',
            description: 'User Gender',
            category: 'userDimensions',
            valueType: 'TEXT',
            columnTags: ['DISPLAY']
          }
        }
      ]
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
          tableId
        },
        {
          id: 'gender',
          name: 'Gender',
          description: 'User Gender',
          category: 'userDimensions',
          valueType: 'TEXT',
          tags: ['DISPLAY'],
          source,
          tableId
        }
      ],
      'Dimension connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableDimensions({ edges: [] }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });

  test('_normalizeTableTimeDimensions', function(assert) {
    const tableId = 'siteAnalytics';
    const source = 'myApi';
    const timeDimensionPayload = {
      edges: [
        {
          node: {
            id: 'userSignupDate',
            name: 'User Signup Date',
            description: 'Date that the user signed up',
            category: 'userDimensions',
            valueType: 'DATE',
            columnTags: ['DISPLAY'],
            supportedGrains: ['day', 'week', 'month'],
            timeZone: {
              short: 'PST',
              long: 'Pacific Standard Time'
            }
          }
        },
        {
          node: {
            id: 'orderMonth',
            name: 'Order Month',
            description: 'Month an order was placed',
            category: 'userDimensions',
            valueType: 'DATE',
            columnTags: ['DISPLAY'],
            supportedGrains: ['month'],
            timeZone: {
              short: 'CST',
              long: 'Central Standard Time'
            }
          }
        }
      ]
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
          supportedGrains: ['day', 'week', 'month'],
          timeZone: {
            short: 'PST',
            long: 'Pacific Standard Time'
          },
          source,
          tableId
        },
        {
          id: 'orderMonth',
          name: 'Order Month',
          description: 'Month an order was placed',
          category: 'userDimensions',
          valueType: 'DATE',
          tags: ['DISPLAY'],
          supportedGrains: ['month'],
          timeZone: {
            short: 'CST',
            long: 'Central Standard Time'
          },
          source,
          tableId
        }
      ],
      'Time Dimension connection payload is normalized properly for a table'
    );

    assert.deepEqual(
      Serializer._normalizeTableTimeDimensions({ edges: [] }, tableId, source),
      [],
      'A connection with no edges returns an empty array'
    );
  });
});
