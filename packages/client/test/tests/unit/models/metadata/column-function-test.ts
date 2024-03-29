import { module, test } from 'qunit';
import ColumnFunctionMetadataModel, {
  ColumnFunctionMetadataPayload,
} from '@yavin/client/models/metadata/column-function';
import FunctionParameterMetadataModel, {
  DataType,
  FunctionParameterMetadataPayload,
} from '@yavin/client/models/metadata/function-parameter';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
import { nullInjector } from '../../../helpers/injector';

let Payload: ColumnFunctionMetadataPayload, ColumnFunction: ColumnFunctionMetadataModel;

module('Unit | Metadata Model | Column Function', function (hooks) {
  hooks.beforeEach(async function () {
    const paramPayload: FunctionParameterMetadataPayload = {
      id: 'currency',
      name: 'Currency',
      description: 'moneyz',
      source: 'bardOne',
      valueType: DataType.TEXT,
      valueSourceType: ValueSourceType.ENUM,
      defaultValue: 'USD',
    };

    Payload = {
      id: 'moneyMetric',
      name: 'Money Metric',
      description: 'Currency parameter',
      source: 'bardOne',
      _parametersPayload: [paramPayload],
    };

    ColumnFunction = new ColumnFunctionMetadataModel(nullInjector, Payload);
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
    assert.deepEqual(param.valueType, paramPayload?.valueType, 'parameters valueType property is hydrated properly');
    assert.deepEqual(
      param.valueSourceType,
      paramPayload?.valueSourceType,
      'parameters valueSourceType property is hydrated properly'
    );
    assert.deepEqual(
      param.defaultValue,
      paramPayload?.defaultValue,
      'parameters defaultValue property is hydrated properly'
    );
  });
});
