import { module, test } from 'qunit';
import FunctionParameterMetadataModel, {
  DataType,
  FunctionParameterMetadataPayload,
} from '@yavin/client/models/metadata/function-parameter';
import { setupTest } from 'ember-qunit';
import type { TestContext } from 'ember-test-helpers';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

let Payload: FunctionParameterMetadataPayload;
let FunctionParameter: FunctionParameterMetadataModel;

module('Unit | Metadata Model | Function Parameter', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    Payload = {
      id: 'currency',
      name: 'Currency',
      valueType: DataType.TEXT,
      source: 'bardOne',
      valueSourceType: ValueSourceType.ENUM,
      _localValues: [
        { id: 'USD', name: 'US Dollars' },
        { id: 'EUR', name: 'Euros' },
      ],
      defaultValue: 'USD',
    };

    FunctionParameter = new FunctionParameterMetadataModel(this.owner.lookup('service:client-injector'), Payload);
  });

  test('it properly hydrates properties', function (assert) {
    assert.deepEqual(FunctionParameter.id, Payload.id, 'id property is hydrated properly');
    assert.equal(FunctionParameter.name, Payload.name, 'name property was properly hydrated');
    assert.equal(FunctionParameter.valueType, Payload.valueType, 'valueType property was properly hydrated');
    assert.equal(
      FunctionParameter.valueSourceType,
      Payload.valueSourceType,
      'valueSourceType property was properly hydrated'
    );

    assert.strictEqual(
      FunctionParameter['_localValues'],
      Payload._localValues,
      '_localValues property was properly hydrated'
    );

    assert.equal(FunctionParameter.defaultValue, Payload.defaultValue, 'defaultValue property was properly hydrated');
  });

  test('values', async function (assert) {
    //Test ENUM
    const enumValues = await FunctionParameter.values;
    assert.deepEqual(enumValues, Payload._localValues, 'enum value source type returns the local values');

    //Test TABLE
    FunctionParameter.valueSourceType = ValueSourceType.TABLE;
    FunctionParameter.tableSource = {
      valueSource: 'gender',
    };
    const tableValues = await FunctionParameter.values;
    assert.deepEqual(
      tableValues,
      [
        { description: '1 (Licensed Steel Keyboard)', id: '1', name: '1' },
        { description: '2 (Intelligent Cotton Soap)', id: '2', name: '2' },
        { description: '3 (Refined Wooden Tuna)', id: '3', name: '3' },
        { description: '4 (Generic Granite Car)', id: '4', name: '4' },
        { description: '5 (Refined Frozen Chair)', id: '5', name: '5' },
      ],
      'table value source type returns table values'
    );

    //Test NONE
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    const noneValues = await FunctionParameter.values;
    assert.deepEqual(noneValues, [], 'none value source type returns an empty array');

    //Test NONE + boolean Value
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    FunctionParameter.valueType = DataType.BOOLEAN;
    const booleanValues = await FunctionParameter.values;
    assert.deepEqual(
      booleanValues,
      [
        { id: true, name: 'True' },
        { id: false, name: 'False' },
      ],
      'none value source type of type boolean returns boolean values'
    );
  });
});
