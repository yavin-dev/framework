import { module, test } from 'qunit';
import FunctionArgumentMetadataModel, { INTRINSIC_VALUE_EXPRESSION } from 'navi-data/models/metadata/function-argument';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import Pretender from 'pretender';

import metadataRoutes from '../../../helpers/metadata-routes';

const HOST = config.navi.dataSources[0].uri;

let Payload, FunctionArgument, server;

module('Unit | Metadata Model | Function Argument', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    server = new Pretender(metadataRoutes);
    await this.owner.lookup('service:bard-metadata').loadMetadata();

    Payload = {
      id: 'currency',
      name: 'Currency',
      valueType: 'TEXT',
      type: 'ref',
      expression: 'dimension:dimensionOne',
      _localValues: null,
      defaultValue: 'USD'
    };

    FunctionArgument = FunctionArgumentMetadataModel.create(this.owner.ownerInjection(), Payload);
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(FunctionArgumentMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(7);

    assert.deepEqual(FunctionArgument.id, Payload.id, 'id property is hydrated properly');

    assert.equal(FunctionArgument.name, Payload.name, 'name property was properly hydrated');

    assert.equal(FunctionArgument.valueType, Payload.valueType, 'valueType property was properly hydrated');

    assert.equal(FunctionArgument.type, Payload.type, 'type property was properly hydrated');

    assert.equal(FunctionArgument.expression, Payload.expression, 'expression property was properly hydrated');

    assert.strictEqual(
      FunctionArgument._localValues,
      Payload._localValues,
      '_localValues property was properly hydrated'
    );

    assert.equal(FunctionArgument.defaultValue, Payload.defaultValue, 'defaultValue property was properly hydrated');
  });

  test('values', async function(assert) {
    assert.expect(3);

    const valuesResponse = {
      rows: [{ id: 'USD', description: 'US Dollars' }, { id: 'EUR', description: 'Euros' }],
      meta: { test: true }
    };

    //setup Pretender
    server.get(`${HOST}/v1/dimensions/dimensionOne/values/`, function() {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify(valuesResponse)];
    });
    const values = await FunctionArgument.values;

    assert.deepEqual(
      values.map(val => ({ id: val.id, description: val.description })),
      valuesResponse.rows,
      'Values are returned correctly for a dimension type function argument'
    );

    const trendArgPayload = {
      id: 'trend',
      name: 'Trend',
      valueType: 'TEXT',
      type: 'ref',
      expression: INTRINSIC_VALUE_EXPRESSION,
      _localValues: [
        {
          id: 'yoy',
          description: 'Year Over Year'
        },
        {
          id: 'wow',
          description: 'Week Over Week'
        }
      ],
      defaultValue: 'wow'
    };

    const TrendFunctionArgument = FunctionArgumentMetadataModel.create(this.owner.ownerInjection(), trendArgPayload);
    const trendValues = await TrendFunctionArgument.values;

    assert.deepEqual(
      trendValues,
      trendArgPayload._localValues,
      'Self referenced function arguments return the local values'
    );

    const noValuesPayload = {
      id: 'foo',
      name: 'Foo',
      valueType: 'TEXT',
      type: 'primitive',
      expression: null,
      _localValues: null,
      defaultValue: '1'
    };
    const NoValuesFunctionArgument = FunctionArgumentMetadataModel.create(this.owner.ownerInjection(), noValuesPayload);
    const noValues = await NoValuesFunctionArgument.values;

    assert.strictEqual(noValues, undefined, 'function argument values returns undefined for primitive arguments');
  });
});
