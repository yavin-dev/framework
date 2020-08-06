import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { constructFunctionParameters, normalizeColumnFunctions } from 'navi-data/serializers/metadata/column-function';
import { ColumnFunctionMoneyMetric } from '../../../helpers/metadata-routes';

const FunctionArguments = [
  {
    id: 'currency',
    name: 'currency',
    valueType: 'TEXT',
    description: undefined,
    type: 'ref',
    expression: 'dimension:displayCurrency',
    source: 'dataSourceOne',
    _localValues: undefined,
    defaultValue: 'USD'
  },
  {
    id: 'type',
    name: 'type',
    description: undefined,
    valueType: 'TEXT',
    type: 'ref',
    expression: 'self',
    source: 'dataSourceOne',
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

module('Unit | Column Function Serializer', function(hooks) {
  setupTest(hooks);

  test('_normalizeColumnFunctions', function(assert) {
    const expected = [
      {
        id: 'moneyMetric',
        name: 'Money Metric',
        description: 'Money column function',
        source: 'bardOne',
        _parametersPayload: [
          {
            id: 'currency',
            name: 'currency',
            valueType: 'TEXT',
            type: 'ref',
            expression: 'self',
            source: 'bardOne',
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

    const result = normalizeColumnFunctions([ColumnFunctionMoneyMetric], 'bardOne');
    assert.deepEqual(result, expected, 'Column functions are normalized properly');

    assert.deepEqual(normalizeColumnFunctions([], 'bardOne'), [], 'Empty array payload returns empty array');
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
      constructFunctionParameters(parameters, 'dataSourceOne'),
      FunctionArguments,
      'The parameter objects are successfully turned into column function arguments'
    );
  });
});
