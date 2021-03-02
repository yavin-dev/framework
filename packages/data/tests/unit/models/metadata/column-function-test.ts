import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import ColumnFunctionMetadataModel, { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import FunctionParameterMetadataModel, {
  FunctionParameterMetadataPayload,
} from 'navi-data/models/metadata/function-parameter';

let Payload: ColumnFunctionMetadataPayload, ColumnFunction: ColumnFunctionMetadataModel;

module('Unit | Metadata Model | Column Function', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const paramPayload: FunctionParameterMetadataPayload = {
      id: 'currency',
      name: 'Currency',
      description: 'moneyz',
      source: 'bardOne',
      type: 'ref',
      expression: 'dimension:displayCurrency',
      defaultValue: 'USD',
    };

    Payload = {
      id: 'moneyMetric',
      name: 'Money Metric',
      description: 'Currency parameter',
      source: 'bardOne',
      _parametersPayload: [paramPayload],
    };

    ColumnFunction = ColumnFunctionMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  test('factory has identifierField defined', function (assert) {
    assert.expect(1);

    assert.equal(ColumnFunctionMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', async function (assert) {
    const { id, name, description, source, parameters } = ColumnFunction;

    assert.equal(id, Payload.id, 'id property is hydrated properly');
    assert.equal(name, Payload.name, 'name property is hydrated properly');
    assert.equal(description, Payload.description, 'description property is hydrated properly');
    assert.equal(source, Payload.source, 'source property is hydrated properly');

    const param = parameters[0];
    const paramPayload = Payload._parametersPayload?.[0];

    assert.ok(param instanceof FunctionParameterMetadataModel, 'parameters are loaded into their metadata model');
    assert.deepEqual(param.id, paramPayload?.id, 'parameters id property is hydrated properly');
    assert.deepEqual(param.name, paramPayload?.name, 'parameters name property is hydrated properly');
    assert.deepEqual(
      param.description,
      paramPayload?.description,
      'parameters description property is hydrated properly'
    );
    assert.deepEqual(param.source, paramPayload?.source, 'parameters source property is hydrated properly');
    assert.deepEqual(param.type, paramPayload?.type, 'parameters type property is hydrated properly');
    assert.deepEqual(param.expression, paramPayload?.expression, 'parameters expression property is hydrated properly');
    assert.deepEqual(
      param.defaultValue,
      paramPayload?.defaultValue,
      'parameters defaultValue property is hydrated properly'
    );
  });
});
