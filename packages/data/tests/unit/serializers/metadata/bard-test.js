import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';

const Payload = {
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
              name: 'metricFour',
              longName: 'Metric Four',
              uri: 'https://metric-four-url',
              type: 'money',
              parameters: {
                currency: {
                  type: 'dimension',
                  dimensionName: 'displayCurrency',
                  defaultValue: 'USD'
                },
                format: {
                  type: 'dimension',
                  dimensionName: 'displayFormat',
                  defaultValue: 'none'
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
              datatype: 'text',
              fields: [
                {
                  name: 'foo',
                  description: 'bar'
                }
              ]
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
              name: 'metricFive',
              longName: 'Metric Five',
              uri: 'https://metric-five-url',
              type: 'number',
              metricFunctionId: 'metricFunctionId take precedence over parameters',
              parameters: {
                whiteNoise: {
                  type: 'dimension',
                  dimensionName: 'displayCurrency',
                  defaultValue: 'USD'
                }
              }
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
              datatype: 'text',
              fields: [
                {
                  name: 'foo',
                  description: 'bar'
                }
              ]
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
              datatype: 'text',
              fields: [
                {
                  name: 'foo',
                  description: 'bar'
                }
              ]
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
};
// list of table objects, with table->timegrains->dimensions+metrics
const Tables = [
  {
    cardinality: 'MEDIUM',
    category: 'General',
    description: 'Table Description',
    dimensionIds: ['dimensionOne', 'dimensionTwo'],
    id: 'tableName',
    metricIds: ['metricOne', 'metricFour', 'metricTwo'],
    name: 'tableLongName',
    source: 'bardOne',
    timeDimensionIds: ['dimensionThree', 'tableName.dateTime'],
    timeGrainIds: ['day', 'month']
  },
  {
    cardinality: 'MEDIUM',
    category: 'Special',
    description: "Second table's description",
    dimensionIds: ['dimensionTwo'],
    id: 'secondTable',
    metricIds: ['metricFive', 'metricTwo', 'metricOne', 'metricThree'],
    name: 'Second Table',
    source: 'bardOne',
    timeDimensionIds: ['dimensionThree', 'secondTable.dateTime'],
    timeGrainIds: ['day', 'week']
  }
];

const Dimensions = [
  {
    cardinality: 'SMALL',
    category: 'categoryOne',
    description: undefined,
    id: 'dimensionOne',
    name: 'Dimension One',
    source: 'bardOne',
    type: 'field',
    valueType: 'text',
    fields: undefined,
    storageStrategy: null,
    partialData: true
  },
  {
    cardinality: 'SMALL',
    category: 'categoryTwo',
    description: undefined,
    id: 'dimensionTwo',
    name: 'Dimension Two',
    source: 'bardOne',
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
];

const TimeDimensions = [
  {
    cardinality: 'MEDIUM',
    category: 'dateCategory',
    description: undefined,
    id: 'dimensionThree',
    name: 'Dimension Three',
    source: 'bardOne',
    type: 'field',
    fields: undefined,
    valueType: 'date',
    storageStrategy: null,
    partialData: true
  },
  {
    category: 'Date',
    columnFunctionId: 'tableName.grain(day,month)',
    description: undefined,
    fields: undefined,
    id: 'tableName.dateTime',
    name: 'Date Time',
    source: 'bardOne',
    supportedGrains: [
      {
        expression: '',
        grain: 'DAY',
        id: 'tableName.dateTime.day'
      },
      {
        expression: '',
        grain: 'MONTH',
        id: 'tableName.dateTime.month'
      }
    ],
    timeZone: 'UTC',
    type: 'field',
    valueType: 'date'
  },
  {
    category: 'Date',
    columnFunctionId: 'secondTable.grain(day,week)',
    description: undefined,
    fields: undefined,
    id: 'secondTable.dateTime',
    name: 'Date Time',
    source: 'bardOne',
    supportedGrains: [
      {
        expression: '',
        grain: 'DAY',
        id: 'secondTable.dateTime.day'
      },
      {
        expression: '',
        grain: 'WEEK',
        id: 'secondTable.dateTime.week'
      }
    ],
    timeZone: 'UTC',
    type: 'field',
    valueType: 'date'
  }
];

const Metrics = [
  {
    category: 'category',
    id: 'metricOne',
    columnFunctionId: undefined,
    description: undefined,
    name: 'Metric One',
    partialData: true,
    source: 'bardOne',
    type: 'field',
    valueType: 'number'
  },
  {
    category: 'category',
    id: 'metricFour',
    columnFunctionId: 'currency|format',
    description: undefined,
    name: 'Metric Four',
    partialData: true,
    source: 'bardOne',
    type: 'field',
    valueType: 'money'
  },
  {
    category: 'category',
    id: 'metricTwo',
    columnFunctionId: 'currency',
    description: undefined,
    name: 'Metric Two',
    partialData: true,
    source: 'bardOne',
    type: 'field',
    valueType: 'money'
  },
  {
    category: 'category',
    id: 'metricFive',
    columnFunctionId: 'metricFunctionId take precedence over parameters',
    description: undefined,
    name: 'Metric Five',
    partialData: true,
    source: 'bardOne',
    type: 'field',
    valueType: 'number'
  },
  {
    category: 'category',
    id: 'metricThree',
    columnFunctionId: undefined,
    description: undefined,
    name: 'Metric Three',
    partialData: true,
    source: 'bardOne',
    type: 'field',
    valueType: 'number'
  }
];

const ParameterConvertToMetricFunction = [
  {
    _parametersPayload: [
      {
        _localValues: undefined,
        source: 'bardOne',
        defaultValue: 'USD',
        description: undefined,
        expression: 'dimension:displayCurrency',
        id: 'currency',
        name: 'currency',
        type: 'ref'
      },
      {
        _localValues: undefined,
        source: 'bardOne',
        defaultValue: 'none',
        description: undefined,
        expression: 'dimension:displayFormat',
        id: 'format',
        name: 'format',
        type: 'ref'
      }
    ],
    description: '',
    id: 'currency|format',
    name: '',
    source: 'bardOne'
  },
  {
    _parametersPayload: [
      {
        _localValues: undefined,
        source: 'bardOne',
        defaultValue: 'USD',
        description: undefined,
        expression: 'dimension:displayCurrency',
        id: 'currency',
        name: 'currency',
        type: 'ref'
      }
    ],
    description: '',
    id: 'currency',
    name: '',
    source: 'bardOne'
  },
  {
    id: 'tableName.grain(day,month)',
    name: 'Time Grain',
    description: 'Time Grain',
    source: 'bardOne',
    _parametersPayload: [
      {
        defaultValue: 'day',
        description: 'The Time Grain to group dates by',
        expression: 'self',
        id: 'grain',
        name: 'Time Grain',
        source: 'bardOne',
        type: 'ref',
        _localValues: [
          { id: 'day', description: 'The tableName day grain', name: 'Day' },
          { id: 'month', description: 'The tableName month grain', name: 'MONTH' }
        ]
      }
    ]
  },
  {
    id: 'secondTable.grain(day,week)',
    name: 'Time Grain',
    description: 'Time Grain',
    source: 'bardOne',
    _parametersPayload: [
      {
        defaultValue: 'day',
        description: 'The Time Grain to group dates by',
        expression: 'self',
        id: 'grain',
        name: 'Time Grain',
        source: 'bardOne',
        type: 'ref',
        _localValues: [
          {
            description: 'The secondTable day grain',
            id: 'day',
            name: 'Day'
          },
          {
            description: 'The secondTable week grain',
            id: 'week',
            name: 'Week'
          }
        ]
      }
    ]
  }
];

let Serializer;

module('Unit | Serializer | metadata/bard', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:metadata/bard');
  });

  test('normalize `everything` with metric legacy `parameters`', function(assert) {
    assert.deepEqual(
      Serializer.normalize('everything', Payload, 'bardOne'),
      {
        metrics: Metrics,
        dimensions: Dimensions,
        timeDimensions: TimeDimensions,
        tables: Tables,
        columnFunctions: ParameterConvertToMetricFunction
      },
      'One column function is created for all metrics with only the currency parameter'
    );
  });

  test('normalize `everything` with column functions', function(assert) {
    const MetricFunctionIdsPayload = {
      metricFunctions: [
        {
          id: 'moneyMetric',
          name: 'Mo Money',
          description: 'Mo Problems',
          arguments: {
            currency: {
              type: 'enum',
              defaultValue: null,
              values: ['USD', 'CAN'],
              description: 'Currency Parameter'
            }
          }
        }
      ],
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
              dimensions: []
            }
          ]
        }
      ]
    };

    const { metrics, columnFunctions } = Serializer.normalize('everything', MetricFunctionIdsPayload, 'bardOne');

    assert.deepEqual(
      metrics,
      [
        {
          category: 'category',
          id: 'metricOne',
          name: 'Metric One',
          description: undefined,
          valueType: 'number',
          source: 'bardOne',
          columnFunctionId: undefined,
          type: 'field',
          partialData: true
        },
        {
          category: 'category',
          id: 'metricTwo',
          name: 'Metric Two',
          description: undefined,
          valueType: 'money',
          source: 'bardOne',
          columnFunctionId: 'moneyMetric',
          type: 'field',
          partialData: true
        }
      ],
      'The metric with parameters has a columnFunctionId provided by the raw data'
    );

    assert.deepEqual(
      columnFunctions,
      [
        {
          _parametersPayload: [
            {
              _localValues: ['USD', 'CAN'],
              defaultValue: null,
              description: 'Currency Parameter',
              expression: 'self',
              id: 'currency',
              name: 'currency',
              type: 'ref',
              source: 'bardOne'
            }
          ],
          description: 'Mo Problems',
          id: 'moneyMetric',
          name: 'Mo Money',
          source: 'bardOne'
        },
        {
          description: 'Time Grain',
          id: 'tableName.grain(day)',
          name: 'Time Grain',
          source: 'bardOne',
          _parametersPayload: [
            {
              defaultValue: 'day',
              description: 'The Time Grain to group dates by',
              expression: 'self',
              id: 'grain',
              name: 'Time Grain',
              source: 'bardOne',
              type: 'ref',
              _localValues: [
                {
                  description: 'The tableName day grain',
                  id: 'day',
                  name: 'Day'
                }
              ]
            }
          ]
        }
      ],
      'Raw column functions are normalized correctly'
    );
  });

  test('normalizeDimensions', function(assert) {
    const rawDimension = {
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
    const source = 'bardOne';

    assert.deepEqual(
      Serializer.normalizeDimensions([rawDimension], source),
      [
        {
          id: rawDimension.name,
          name: rawDimension.longName,
          description: undefined,
          category: rawDimension.category,
          valueType: rawDimension.datatype,
          cardinality: 'SMALL',
          type: 'field',
          storageStrategy: null,
          fields: rawDimension.fields,
          source,
          partialData: true
        }
      ],
      'New dimension is constructed correctly normalized'
    );
  });

  test('normalizeMetrics', function(assert) {
    const source = 'bardOne';

    const rawMetric = {
      category: 'categoryOne',
      name: 'metricOne',
      longName: 'Metric One',
      uri: 'https://metric-one-url',
      type: 'number',
      columnFunctionId: 'money'
    };

    assert.deepEqual(
      Serializer.normalizeMetrics([rawMetric], source),
      [
        {
          id: rawMetric.name,
          name: rawMetric.longName,
          description: undefined,
          category: rawMetric.category,
          valueType: rawMetric.type,
          source,
          columnFunctionId: rawMetric.metricFunctionId,
          type: 'field',
          partialData: true
        }
      ],
      'Metric is constructed correctly with no new column function id or parameter'
    );
  });

  test('configure defaultTimeGrain if it exists', async function(assert) {
    const originalDefaultTimeGrain = config.navi.defaultTimeGrain;

    const table = {
      name: 'table',
      timeGrains: [
        { name: 'day', longName: 'Day' },
        { name: 'hour', longName: 'Hour' },
        { name: 'week', longName: 'Week' },
        { name: 'month', longName: 'Month' }
      ]
    };

    config.navi.defaultTimeGrain = 'week';
    let columnFunction = Serializer.createTimeGrainColumnFunction(table, 'bardOne');
    assert.equal(columnFunction._parametersPayload[0].defaultValue, 'week', 'Picks default from config');

    config.navi.defaultTimeGrain = 'year';
    columnFunction = Serializer.createTimeGrainColumnFunction(table, 'bardOne');
    assert.equal(columnFunction._parametersPayload[0].defaultValue, 'day', 'Falls back to first defined grain');

    config.navi.defaultTimeGrain = 'hour';
    columnFunction = Serializer.createTimeGrainColumnFunction(table, 'bardOne');
    assert.equal(columnFunction._parametersPayload[0].defaultValue, 'hour', 'Picks default from config');

    config.navi.defaultTimeGrain = originalDefaultTimeGrain;
  });
});
