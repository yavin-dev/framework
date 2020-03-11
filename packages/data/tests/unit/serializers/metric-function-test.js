import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { constructFunctionArguments } from 'navi-data/serializers/metric-function';
import { MetricFunctionMoneyMetric } from '../../helpers/metadata-routes';

const FunctionArguments = [
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

module('Unit | Metric Function Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:metric-function');
  });

  test('_normalizeMetricFunctions', function(assert) {
    const expected = [
      {
        id: 'moneyMetric',
        name: 'Money Metric',
        description: 'Money metric function',
        source: 'dummy',
        arguments: [
          {
            id: 'currency',
            name: 'currency',
            valueType: 'TEXT',
            type: 'ref',
            expression: 'self',
            values: [
              {
                description: 'US Dollars',
                id: 'USD'
              },
              {
                description: 'Euros',
                id: 'EUR'
              }
            ],
            defaultValue: 'USD'
          }
        ]
      }
    ];

    const result = Serializer._normalizeMetricFunctions([MetricFunctionMoneyMetric], 'dummy');
    assert.deepEqual(result, expected, 'Metric functions are normalized properly');

    assert.deepEqual(Serializer._normalizeMetricFunctions([], 'dummy'), [], 'Empty array payload returns empty array');
  });

  test('constructFunctionArguments', function(assert) {
    const parameters = {
      currency: {
        type: 'dimension',
        defaultValue: 'USD',
        dimensionName: 'displayCurrency'
      },
      type: {
        type: 'enum',
        defaultValue: 'l',
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
        ]
      }
    };

    assert.deepEqual(
      constructFunctionArguments(parameters),
      FunctionArguments,
      'The parameter objects are successfully turned into metric function arguments'
    );
  });
});
