import { module, test } from 'qunit';
import FunctionParameterMetadataModel, {
  FunctionParameterMetadataPayload,
  INTRINSIC_VALUE_EXPRESSION
} from 'navi-data/models/metadata/function-parameter';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import Pretender, { Server } from 'pretender';
import { TestContext } from 'ember-test-helpers';
// @ts-ignore
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';

const HOST = config.navi.dataSources[0].uri;

let Payload: FunctionParameterMetadataPayload;
let server: Server;
let FunctionParameter: FunctionParameterMetadataModel;

module('Unit | Metadata Model | Function Parameter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    server = new Pretender(metadataRoutes);
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    Payload = {
      id: 'currency',
      name: 'Currency',
      type: 'ref',
      source: 'bardOne',
      expression: 'dimension:dimensionOne',
      _localValues: undefined,
      defaultValue: 'USD'
    };

    FunctionParameter = FunctionParameterMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(FunctionParameterMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.deepEqual(FunctionParameter.id, Payload.id, 'id property is hydrated properly');

    assert.equal(FunctionParameter.name, Payload.name, 'name property was properly hydrated');

    assert.equal(FunctionParameter.type, Payload.type, 'type property was properly hydrated');

    assert.equal(FunctionParameter.expression, Payload.expression, 'expression property was properly hydrated');

    assert.strictEqual(
      FunctionParameter._localValues,
      Payload._localValues,
      '_localValues property was properly hydrated'
    );

    assert.equal(FunctionParameter.defaultValue, Payload.defaultValue, 'defaultValue property was properly hydrated');
  });

  test('values', async function(assert) {
    assert.expect(3);

    const valuesResponse = {
      rows: [
        { id: 'USD', description: 'US Dollars' },
        { id: 'EUR', description: 'Euros' }
      ],
      meta: { test: true }
    };

    //setup Pretender
    server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(valuesResponse)];
    });
    const values = await FunctionParameter.values;

    assert.deepEqual(
      values?.map(val => ({ id: val.id, description: val.description })),
      valuesResponse.rows,
      'Values are returned correctly for a dimension type function argument'
    );

    const trendArgPayload: FunctionParameterMetadataPayload = {
      id: 'trend',
      name: 'Trend',
      source: 'bardOne',
      type: 'ref',
      expression: INTRINSIC_VALUE_EXPRESSION,
      _localValues: [
        {
          id: 'yoy',
          name: 'YoY',
          description: 'Year Over Year'
        },
        {
          id: 'wow',
          name: 'WoW',
          description: 'Week Over Week'
        }
      ],
      defaultValue: 'wow'
    };

    const TrendFunctionArgument = FunctionParameterMetadataModel.create(this.owner.ownerInjection(), trendArgPayload);
    const trendValues = await TrendFunctionArgument.values;

    assert.deepEqual(
      trendValues,
      trendArgPayload._localValues,
      'Self referenced function arguments return the local values'
    );

    const noValuesPayload: FunctionParameterMetadataPayload = {
      id: 'foo',
      name: 'Foo',
      type: 'primitive',
      source: 'bardOne',
      expression: undefined,
      _localValues: undefined,
      defaultValue: '1'
    };
    const NoValuesFunctionArgument = FunctionParameterMetadataModel.create(
      this.owner.ownerInjection(),
      noValuesPayload
    );
    const noValues = await NoValuesFunctionArgument.values;

    assert.strictEqual(noValues, undefined, 'function argument values returns undefined for primitive arguments');
  });
});
