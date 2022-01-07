import { module, test } from 'qunit';
import FunctionParameterMetadataModel, {
  DataType,
  FunctionParameterMetadataPayload,
} from 'navi-data/models/metadata/function-parameter';
import { setupTest } from 'ember-qunit';
import Pretender, { Server } from 'pretender';
// @ts-ignore
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';
import type { TestContext } from 'ember-test-helpers';
import type { Factory } from 'navi-data/models/native-with-create';
import { ValueSourceType } from 'navi-data/models/metadata/elide/dimension';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

let Payload: FunctionParameterMetadataPayload;
let server: Server;
let FunctionParameterFactory: Factory<typeof FunctionParameterMetadataModel>;
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
        { id: 'USD', description: 'US Dollars' },
        { id: 'EUR', description: 'Euros' },
      ],
      defaultValue: 'USD',
    };

    FunctionParameterFactory = this.owner.factoryFor('model:metadata/function-parameter');
    FunctionParameter = FunctionParameterFactory.create(Payload);
  });

  test('factory has identifierField defined', function (assert) {
    assert.equal(FunctionParameterMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function (assert) {
    assert.deepEqual(FunctionParameter.id, Payload.id, 'id property is hydrated properly');
    assert.equal(FunctionParameter.name, Payload.name, 'name property was properly hydrated');
    assert.equal(FunctionParameter.valueType, Payload.valueType, 'type property was properly hydrated');
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
    assert.expect(4);

    //Test ENUM
    const enumValues = await FunctionParameter.values;
    assert.deepEqual(enumValues, Payload._localValues, 'enum function arguments return the local values');

    //Test TABLE
    FunctionParameter.valueSourceType = ValueSourceType.TABLE;
    FunctionParameter.tableSource = {
      valueSource: 'gender',
    };
    const tableValues = await FunctionParameter.values;
    assert.deepEqual(
      tableValues,
      [
        { description: '1 (Licensed Steel Keyboard)', id: '1' },
        { description: '2 (Intelligent Cotton Soap)', id: '2' },
        { description: '3 (Refined Wooden Tuna)', id: '3' },
        { description: '4 (Generic Granite Car)', id: '4' },
        { description: '5 (Refined Frozen Chair)', id: '5' },
      ],
      'table function arguments return table values'
    );

    //Test NONE
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    const noneValues = await FunctionParameter.values;
    assert.deepEqual(noneValues, undefined, 'none function arguments return undefined');

    //Test NONE + ENUM Value
    FunctionParameter.valueSourceType = ValueSourceType.NONE;
    FunctionParameter.valueType = DataType.BOOLEAN;
    const booleanValues = await FunctionParameter.values;
    assert.deepEqual(booleanValues, [true, false], 'none function arguments return undefined');
  });
});
