import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const emberGuidRegex = /ember\d+/;
const Payload = {
    source: 'dummy',
    tables: [
      {
        name: 'tableName',
        description: 'Table Description',
        longName: 'tableLongName',
        category: 'General',
        timeGrains: [
          {
            name: 'day',
            description: 'The tableName day grain',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricTwo',
                longName: 'Metric Two',
                uri: 'https://metric-two-url',
                type: 'money',
                parameters: {
                  currency: {
                    type: 'dimension',
                    dimensionName: 'displayCurrency',
                    defaultValue: 'USD'
                  }
                }
              }
            ],
            retention: 'P24M',
            longName: 'Day',
            dimensions: [
              {
                category: 'categoryOne',
                name: 'dimensionOne',
                longName: 'Dimension One',
                uri: 'https://host:port/namespace/dimensions/dimensionOne',
                cardinality: '10',
                datatype: 'text'
              },
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5',
                fields: [
                  {
                    name: 'foo',
                    description: 'bar'
                  }
                ],
                datatype: 'text'
              },
              {
                category: 'dateCategory',
                name: 'dimensionThree',
                longName: 'Dimension Three',
                uri: 'https://host:port/namespace/dimensions/dimensionThree',
                cardinality: '50000',
                datatype: 'date'
              }
            ]
          },
          {
            name: 'month',
            description: 'The tableName month grain',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricTwo',
                longName: 'Metric Two',
                uri: 'https://metric-two-url',
                type: 'money',
                parameters: {
                  currency: {
                    type: 'dimension',
                    dimensionName: 'displayCurrency',
                    defaultValue: 'USD'
                  }
                }
              }
            ],
            retention: 'P24M',
            longName: 'MONTH',
            dimensions: [
              {
                category: 'categoryOne',
                name: 'dimensionOne',
                longName: 'Dimension One',
                uri: 'https://host:port/namespace/dimensions/dimensionOne',
                cardinality: '10',
                datatype: 'text'
              },
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5',
                datatype: 'text'
              },
              {
                category: 'dateCategory',
                name: 'dimensionThree',
                longName: 'Dimension Three',
                uri: 'https://host:port/namespace/dimensions/dimensionThree',
                cardinality: '50000',
                datatype: 'date'
              }
            ]
          }
        ]
      },
      {
        name: 'secondTable',
        longName: 'Second Table',
        description: "Second table's description",
        category: 'Special',
        timeGrains: [
          {
            name: 'day',
            description: 'The secondTable day grain',
            longName: 'Day',
            retention: 'P24M',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricTwo',
                longName: 'Metric Two',
                uri: 'https://metric-two-url',
                type: 'money',
                parameters: {
                  currency: {
                    type: 'dimension',
                    dimensionName: 'displayCurrency',
                    defaultValue: 'USD'
                  }
                }
              }
            ],
            dimensions: [
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5',
                datatype: 'text'
              },
              {
                category: 'dateCategory',
                name: 'dimensionThree',
                longName: 'Dimension Three',
                uri: 'https://host:port/namespace/dimensions/dimensionThree',
                cardinality: '50000',
                datatype: 'date'
              }
            ]
          },
          {
            name: 'week',
            description: 'The secondTable week grain',
            longName: 'Week',
            retention: 'P24M',
            metrics: [
              {
                category: 'category',
                name: 'metricOne',
                longName: 'Metric One',
                uri: 'https://metric-one-url',
                type: 'number'
              },
              {
                category: 'category',
                name: 'metricThree',
                longName: 'Metric Three',
                uri: 'https://metric-three-url',
                type: 'number'
              }
            ],
            dimensions: [
              {
                category: 'categoryTwo',
                name: 'dimensionTwo',
                longName: 'Dimension Two',
                uri: 'https://host:port/namespace/dimensions/dimensionTwo',
                cardinality: '5',
                datatype: 'text'
              },
              {
                category: 'dateCategory',
                name: 'dimensionThree',
                longName: 'Dimension Three',
                uri: 'https://host:port/namespace/dimensions/dimensionThree',
                cardinality: '50000',
                datatype: 'date'
              }
            ]
          }
        ]
      }
    ]
  },
  // list of table objects, with table->timegrains->dimensions+metrics
  Tables = [
    {
      id: 'tableName',
      description: 'Table Description',
      name: 'tableLongName',
      category: 'General',
      source: 'dummy',
      metricIds: ['metricOne', 'metricTwo'],
      dimensionIds: ['dimensionOne', 'dimensionTwo'],
      timeDimensionIds: ['dimensionThree'],
      timeGrainIds: ['day', 'month'],
      cardinalitySize: 'MEDIUM'
    },
    {
      id: 'secondTable',
      description: "Second table's description",
      name: 'Second Table',
      category: 'Special',
      source: 'dummy',
      metricIds: ['metricOne', 'metricTwo', 'metricThree'],
      dimensionIds: ['dimensionTwo'],
      timeDimensionIds: ['dimensionThree'],
      cardinalitySize: 'MEDIUM',
      timeGrainIds: ['day', 'week']
    }
  ],
  Dimensions = [
    {
      cardinality: 'SMALL',
      category: 'categoryOne',
      id: 'dimensionOne',
      name: 'Dimension One',
      source: 'dummy',
      tableIds: ['tableName'],
      type: 'field',
      valueType: 'text',
      fields: undefined,
      storageStrategy: null,
      partialData: true
    },
    {
      cardinality: 'SMALL',
      category: 'categoryTwo',
      id: 'dimensionTwo',
      name: 'Dimension Two',
      source: 'dummy',
      tableIds: ['tableName', 'secondTable'],
      type: 'field',
      valueType: 'text',
      fields: [
        {
          name: 'foo',
          description: 'bar'
        }
      ],
      storageStrategy: null,
      partialData: true
    }
  ],
  TimeDimensions = [
    {
      cardinality: 'MEDIUM',
      category: 'dateCategory',
      id: 'dimensionThree',
      name: 'Dimension Three',
      source: 'dummy',
      tableIds: ['tableName', 'secondTable'],
      type: 'field',
      fields: undefined,
      valueType: 'date',
      storageStrategy: null,
      partialData: true
    }
  ],
  Metrics = [
    {
      category: 'category',
      id: 'metricOne',
      name: 'Metric One',
      valueType: 'number',
      source: 'dummy',
      tableIds: ['tableName', 'secondTable'],
      partialData: true
    },
    {
      category: 'category',
      id: 'metricTwo',
      name: 'Metric Two',
      valueType: 'money',
      source: 'dummy',
      tableIds: ['tableName', 'secondTable'],
      partialData: true
    },
    {
      category: 'category',
      id: 'metricThree',
      name: 'Metric Three',
      valueType: 'number',
      source: 'dummy',
      tableIds: ['secondTable'],
      partialData: true
    }
  ],
  FunctionArguments = [
    {
      id: 'currency',
      name: 'currency',
      valueType: 'TEXT',
      type: 'ref',
      expression: 'dimension:displayCurrency',
      values: null,
      defaultValue: 'USD'
    },
    {
      id: 'type',
      name: 'type',
      valueType: 'TEXT',
      type: 'ref',
      expression: 'self',
      values: [
        {
          id: 'l',
          description: 'Left'
        },
        {
          id: 'r',
          description: 'Right'
        },
        {
          id: 'm',
          description: 'Middle'
        }
      ],
      defaultValue: 'l'
    }
  ];

let Serializer;

module('Unit | Bard Metadata Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:bard-metadata');
  });

  test('normalize without metric function ids provided', function(assert) {
    assert.expect(8);

    const { tables, metrics, dimensions, timeDimensions, metricFunctions } = Serializer.normalize(Payload);

    const metricsWithoutFuncIds = metrics.map(met => {
      const metWithoutFuncId = Object.assign({}, met);
      delete metWithoutFuncId.metricFunctionId;
      return metWithoutFuncId;
    });

    assert.deepEqual(metricsWithoutFuncIds, Metrics, 'Correctly parsed metric objects from payload');

    assert.deepEqual(dimensions, Dimensions, 'Correctly parsed dimension objects from payload');

    assert.deepEqual(timeDimensions, TimeDimensions, 'Correctly parsed and normalized time dimension objects');

    assert.deepEqual(tables, Tables, 'Correctly parsed table objects from payload');

    assert.equal(
      metricFunctions.length,
      1,
      'One metric function is created for all metrics with only the currency parameter'
    );
    const currencyMetricFunctionArguments = [
      {
        id: 'currency',
        name: 'currency',
        valueType: 'TEXT',
        type: 'ref',
        expression: 'dimension:displayCurrency',
        _localValues: null,
        defaultValue: 'USD'
      }
    ];

    const { id: metricFunctionId, arguments: args } = metricFunctions[0];
    assert.deepEqual(args, currencyMetricFunctionArguments, 'The derived metric function has the correct arguments');
    assert.ok(emberGuidRegex.test(metricFunctionId), 'Derived metric function has a uuid as the id');

    const expectedMetricsWithFunctionIds = Metrics.map(metric => {
      if (metric.valueType === 'money') {
        metric.metricFunctionId = metricFunctionId;
      }
      return metric;
    });

    assert.deepEqual(
      metrics,
      expectedMetricsWithFunctionIds,
      'The normalized metrics list has the correct metric function ids attached to them'
    );
  });

  test('normalize with metric function ids provided', function(assert) {
    const MetricFunctionIdsPayload = {
      source: 'dummy',
      tables: [
        {
          name: 'tableName',
          description: 'Table Description',
          longName: 'tableLongName',
          category: 'General',
          timeGrains: [
            {
              name: 'day',
              description: 'The tableName day grain',
              metrics: [
                {
                  category: 'category',
                  name: 'metricOne',
                  longName: 'Metric One',
                  uri: 'https://metric-one-url',
                  type: 'number'
                },
                {
                  category: 'category',
                  name: 'metricTwo',
                  longName: 'Metric Two',
                  uri: 'https://metric-two-url',
                  type: 'money',
                  metricFunctionId: 'moneyMetric'
                }
              ],
              retention: 'P24M',
              longName: 'Day',
              dimensions: [
                {
                  category: 'categoryOne',
                  name: 'dimensionOne',
                  longName: 'Dimension One',
                  uri: 'https://host:port/namespace/dimensions/dimensionOne',
                  cardinality: '10',
                  datatype: 'text'
                }
              ]
            },
            {
              name: 'month',
              description: 'The tableName month grain',
              metrics: [
                {
                  category: 'category',
                  name: 'metricOne',
                  longName: 'Metric One',
                  uri: 'https://metric-one-url',
                  type: 'number'
                },
                {
                  category: 'category',
                  name: 'metricTwo',
                  longName: 'Metric Two',
                  uri: 'https://metric-two-url',
                  type: 'money',
                  metricFunctionId: 'moneyMetric'
                }
              ],
              retention: 'P24M',
              longName: 'MONTH',
              dimensions: [
                {
                  category: 'categoryOne',
                  name: 'dimensionOne',
                  longName: 'Dimension One',
                  uri: 'https://host:port/namespace/dimensions/dimensionOne',
                  cardinality: '10',
                  datatype: 'text'
                }
              ]
            }
          ]
        }
      ]
    };

    const { metrics, dimensions, tables, metricFunctions, timeDimensions } = Serializer.normalize(
      MetricFunctionIdsPayload
    );

    assert.deepEqual(
      metrics,
      [
        {
          category: 'category',
          id: 'metricOne',
          name: 'Metric One',
          valueType: 'number',
          source: 'dummy',
          tableIds: ['tableName'],
          partialData: true
        },
        {
          category: 'category',
          id: 'metricTwo',
          name: 'Metric Two',
          valueType: 'money',
          source: 'dummy',
          tableIds: ['tableName'],
          metricFunctionId: 'moneyMetric',
          partialData: true
        }
      ],
      'The metric with parameters has a metricFunctionId provided by the raw data'
    );

    assert.deepEqual(
      tables,
      [
        {
          id: 'tableName',
          description: 'Table Description',
          name: 'tableLongName',
          category: 'General',
          source: 'dummy',
          metricIds: ['metricOne', 'metricTwo'],
          dimensionIds: ['dimensionOne'],
          timeDimensionIds: [],
          timeGrainIds: ['day', 'month'],
          cardinalitySize: 'SMALL'
        }
      ],
      'Table has the correct columns associated with it'
    );

    assert.deepEqual(
      dimensions,
      [
        {
          cardinality: 'SMALL',
          category: 'categoryOne',
          id: 'dimensionOne',
          name: 'Dimension One',
          source: 'dummy',
          tableIds: ['tableName'],
          type: 'field',
          fields: undefined,
          valueType: 'text',
          storageStrategy: null,
          partialData: true
        }
      ],
      'The lone dimension on the table is returned in the dimensions list'
    );

    assert.deepEqual(timeDimensions, [], 'No time dimensions are present on the table');

    assert.equal(
      metricFunctions,
      null,
      'The metric functions list is set to null when the metric functions are provided in an endpoint'
    );
  });

  test('_getMetricFunction', function(assert) {
    assert.expect(9);

    const metricFunctions = new Set();

    const result = Serializer._getMetricFunction(metricFunctions, FunctionArguments);
    assert.deepEqual(
      Object.keys(result),
      ['name', 'description', 'arguments', 'source', 'id'],
      'Serialized metric function object is returned in the right shape'
    );
    assert.ok(emberGuidRegex.test(result.id), 'A metric function with a ember-guid as its id is returned');
    assert.deepEqual(result.arguments, FunctionArguments, 'The newly created metric function contains the arguments');

    // Add result to the metric functions set
    metricFunctions.add(result);

    const sameResult = Serializer._getMetricFunction(metricFunctions, FunctionArguments);
    assert.equal(
      //explicitly use assert.equal because we are checking that they are the same reference
      sameResult,
      result,
      'Passing the same arguments as an existing metric function returns the existing metric function'
    );
    assert.deepEqual([...metricFunctions], [result], 'No new metric functions should have been created');

    const distinctResult = Serializer._getMetricFunction(metricFunctions, [FunctionArguments[0]]);
    assert.notEqual(
      // Make sure the new result is a different reference
      distinctResult,
      result,
      'A new metric function is created when there is no existing metric function with the exact same arguments'
    );
    assert.ok(emberGuidRegex.test(distinctResult.id), 'New metric function with a ember-guid as its id is returned');
    assert.deepEqual(
      Object.keys(distinctResult),
      ['name', 'description', 'arguments', 'source', 'id'],
      'Serialized metric function object is returned in the right shape'
    );
    assert.deepEqual(
      distinctResult.arguments,
      [FunctionArguments[0]],
      'The new metric function has the expected arguments'
    );
  });

  test('_constructDimension', function(assert) {
    const dimension = {
      category: 'categoryOne',
      name: 'dimensionOne',
      longName: 'Dimension One',
      uri: 'https://host:port/namespace/dimensions/dimensionOne',
      cardinality: '10',
      fields: [
        {
          name: 'foo',
          description: 'bar'
        },
        {
          name: 'baz',
          description: 'bang'
        }
      ],
      datatype: 'text'
    };
    const source = 'dummy';
    const tableName = 'tableOne';
    const currentDimensions = {};
    const expectedDimension = {
      id: dimension.name,
      name: dimension.longName,
      category: dimension.category,
      valueType: dimension.datatype,
      cardinality: 'SMALL',
      type: 'field',
      storageStrategy: null,
      fields: [
        {
          name: 'foo',
          description: 'bar'
        },
        {
          name: 'baz',
          description: 'bang'
        }
      ],
      source,
      tableIds: [tableName],
      partialData: true
    };

    const result = Serializer._constructDimension(dimension, source, tableName, currentDimensions);
    assert.deepEqual(result, expectedDimension, 'New dimension is constructed correctly in the new shape');

    currentDimensions[expectedDimension.id] = result;
    const existingDimensionResult = Serializer._constructDimension(dimension, source, tableName, currentDimensions);

    assert.deepEqual(
      existingDimensionResult,
      expectedDimension,
      'New dimension is not constructed, existing dimension is returned'
    );

    const otherDimension = Object.assign({}, dimension, { name: 'dimensionTwo' });
    const otherDimensionResult = Serializer._constructDimension(otherDimension, source, tableName, currentDimensions);
    const otherExpectedDimension = Object.assign({}, expectedDimension, {
      id: 'dimensionTwo'
    });
    assert.deepEqual(
      otherDimensionResult,
      otherExpectedDimension,
      'Dimension with different name than any existing dimension returns a new dimension with a single grain'
    );
  });

  test('_constructMetric WITHOUT parameters or metric function id provided', function(assert) {
    const metric = {
      category: 'categoryOne',
      name: 'metricOne',
      longName: 'Metric One',
      uri: 'https://metric-one-url',
      type: 'number'
    };
    const source = 'dummy';
    const tableName = 'tableOne';
    const currentMetrics = {};
    const metricFunctions = new Set();
    const expectedMetric = {
      id: metric.name,
      name: metric.longName,
      category: metric.category,
      valueType: metric.type,
      source,
      tableIds: [tableName],
      partialData: true
    };
    const result = Serializer._constructMetric(metric, source, tableName, currentMetrics, metricFunctions);
    assert.deepEqual(
      result,
      { metric: expectedMetric, metricFunction: null, metricFunctionsProvided: false },
      'Metric is constructed correctly with no new metric function and flag for functions being provided is false'
    );

    currentMetrics[expectedMetric.id] = result.metric;

    const existingMetricResult = Serializer._constructMetric(
      metric,
      source,
      tableName,
      currentMetrics,
      metricFunctions
    );
    assert.deepEqual(
      existingMetricResult,
      { metric: expectedMetric, metricFunction: null, metricFunctionsProvided: false },
      'Existing metric is returned with the added timegrain with no new metric function and flag for functions being provided is false'
    );

    const otherMetric = Object.assign({}, metric, { name: 'metricTwo' });
    const otherMetricResult = Serializer._constructMetric(
      otherMetric,
      source,
      tableName,
      currentMetrics,
      metricFunctions
    );
    const otherExpectedMetric = Object.assign({}, expectedMetric, { id: 'metricTwo' });
    assert.deepEqual(
      otherMetricResult,
      {
        metric: otherExpectedMetric,
        metricFunction: null,
        metricFunctionsProvided: false
      },
      'Metric with different name than any existing metric returns a new metric with a single grain'
    );
  });

  test('_constructMetric WITH parameters and no metric function id provided', function(assert) {
    const metric = {
      category: 'categoryOne',
      name: 'metricOne',
      longName: 'Metric One',
      uri: 'https://metric-one-url',
      type: 'number',
      parameters: {
        currency: {
          type: 'dimension',
          dimensionName: 'displayCurrency',
          defaultValue: 'USD'
        }
      }
    };
    const source = 'dummy';
    const tableName = 'tableOne';
    const currentMetrics = {};
    const metricFunctions = new Set();
    const expectedMetric = {
      id: metric.name,
      name: metric.longName,
      category: metric.category,
      valueType: metric.type,
      source,
      tableIds: [tableName],
      partialData: true
    };
    const {
      metric: resultMetric,
      metricFunction: resultMetricFunction,
      metricFunctionsProvided
    } = Serializer._constructMetric(metric, source, tableName, currentMetrics, metricFunctions);

    assert.deepEqual(
      Object.keys(resultMetricFunction),
      ['name', 'description', 'arguments', 'source', 'id'],
      'Metric function object is returned'
    );
    assert.ok(
      emberGuidRegex.test(resultMetricFunction.id),
      'Created metric function id is an instance of an ember guid'
    );
    assert.notOk(
      metricFunctionsProvided,
      'No metricFunctionId in the input metric makes metricFunctionsProvided false'
    );

    expectedMetric.metricFunctionId = resultMetricFunction.id;

    assert.deepEqual(
      resultMetric,
      expectedMetric,
      "Metric is constructed correctly with the new metric function's id included"
    );
  });

  test('_constructMetric WITHOUT parameters and metric function id provided', function(assert) {
    const metric = {
      category: 'categoryOne',
      name: 'metricOne',
      longName: 'Metric One',
      uri: 'https://metric-one-url',
      type: 'number',
      metricFunctionId: 'moneyMetric'
    };
    const source = 'dummy';
    const tableName = 'tableOne';
    const currentMetrics = {};
    const metricFunctions = new Set();
    const expectedMetric = {
      id: metric.name,
      name: metric.longName,
      category: metric.category,
      valueType: metric.type,
      source,
      tableIds: [tableName],
      metricFunctionId: metric.metricFunctionId,
      partialData: true
    };
    const {
      metric: resultMetric,
      metricFunction: resultMetricFunction,
      metricFunctionsProvided
    } = Serializer._constructMetric(metric, source, tableName, currentMetrics, metricFunctions);

    assert.notOk(resultMetricFunction, 'Metric function object is NOT returned');
    assert.ok(metricFunctionsProvided, 'metricFunctionId in the input metric makes metricFunctionsProvided true');
    assert.deepEqual(
      resultMetric,
      expectedMetric,
      "Metric is constructed correctly with the new metric function's id included"
    );
  });
});
