import { module, test } from 'qunit';
import MetricFunctionMetadataModel from 'navi-data/models/metadata/metric-function';
import { setupTest } from 'ember-qunit';

let Payload, MetricFunction;

module('Unit | Metadata Model | Metric Function', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    Payload = {
      id: 'moneyMetric',
      name: 'Money Metric',
      description: 'Currency parameter',
      source: 'dummy',
      arguments: [
        {
          id: 'currency',
          name: 'Currency',
          description: 'moneyz',
          source: 'dummy',
          valueType: 'text',
          type: 'ref',
          expression: 'dimension:displayCurrency',
          defaultValue: 'USD'
        }
      ]
    };

    MetricFunction = MetricFunctionMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(MetricFunctionMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(5);

    const { id, name, description, source, arguments: args } = MetricFunction;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(source, Payload.source, 'source property is hydrated properly');
    assert.deepEqual(args, Payload.arguments, 'arguments property is hydrated properly');
  });
});
