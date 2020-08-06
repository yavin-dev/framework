import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import ColumnFunctionMetadataModel, { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import { FunctionParameterMetadataPayload } from 'navi-data/models/metadata/function-parameter';

let Payload: ColumnFunctionMetadataPayload, ColumnFunction: ColumnFunctionMetadataModel;

module('Unit | Metadata Model | Column Function', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const paramPayload: FunctionParameterMetadataPayload = {
      id: 'currency',
      name: 'Currency',
      description: 'moneyz',
      source: 'bardOne',
      valueType: 'text',
      type: 'ref',
      expression: 'dimension:displayCurrency',
      defaultValue: 'USD'
    };

    Payload = {
      id: 'moneyMetric',
      name: 'Money Metric',
      description: 'Currency parameter',
      source: 'bardOne',
      _parametersPayload: [paramPayload]
    };

    ColumnFunction = ColumnFunctionMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(ColumnFunctionMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(9);

    const { id, name, description, source, parameters } = ColumnFunction;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(source, Payload.source, 'source property is hydrated properly');

    const param = parameters[0];
    const paramPayload = Payload._parametersPayload?.[0];

    assert.deepEqual(param.valueType, paramPayload?.valueType, 'parameters property is hydrated properly');
    assert.deepEqual(param.name, paramPayload?.name, 'parameters property is hydrated properly');
    assert.deepEqual(param.id, paramPayload?.id, 'parameters property is hydrated properly');
    assert.deepEqual(param.id, paramPayload?.id, 'parameters property is hydrated properly');
    assert.deepEqual(param.id, paramPayload?.id, 'parameters property is hydrated properly');
  });
});
