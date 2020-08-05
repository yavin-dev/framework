import { module, test } from 'qunit';
import ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';
import { setupTest } from 'ember-qunit';

let Payload, ColumnFunction;

module('Unit | Metadata Model | Column Function', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    Payload = {
      id: 'moneyMetric',
      name: 'Money Metric',
      description: 'Currency parameter',
      source: 'bardOne',
      arguments: [
        {
          id: 'currency',
          name: 'Currency',
          description: 'moneyz',
          source: 'bardOne',
          valueType: 'text',
          type: 'ref',
          expression: 'dimension:displayCurrency',
          defaultValue: 'USD'
        }
      ]
    };

    ColumnFunction = ColumnFunctionMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(ColumnFunctionMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(5);

    const { id, name, description, source, arguments: args } = ColumnFunction;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(source, Payload.source, 'source property is hydrated properly');
    assert.deepEqual(args, Payload.arguments, 'arguments property is hydrated properly');
  });
});
