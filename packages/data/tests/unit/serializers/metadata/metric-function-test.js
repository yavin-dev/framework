import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { constructFunctionArguments } from 'navi-data/serializers/metadata/metric-function';
import { MetricFunctionMoneyMetric } from '../../../helpers/metadata-routes';

const FunctionArguments = [
  {
    id: 'currency',
    name: 'currency',
    valueType: 'TEXT',
    description: undefined,
    type: 'ref',
    expression: 'dimension:displayCurrency',
    _localValues: null,
    defaultValue: 'USD'
  },
  {
    id: 'type',
    name: 'type',
    description: undefined,
    valueType: 'TEXT',
    type: 'ref',
    expression: 'self',
    _localValues: [
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
    Serializer = this.owner.lookup('serializer:metadata/metric-function');
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
            _localValues: [
              {
                description: 'US Dollars',
                id: 'USD'
              },
              {
                description: 'Euros',
                id: 'EUR'
              }
            ],
            description: undefined,
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
