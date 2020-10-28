import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { set } from '@ember/object';
import { buildTestRequest } from '../../helpers/request';
import StoreService from '@ember-data/store';

module('Unit | Model | Gauge Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('isValidForRequest', function(assert) {
    let request = buildTestRequest([{ field: 'rupees', parameters: {}, cid: 'cid_rupees' }], []);
    const store = this.owner.lookup('service:store') as StoreService;
    const { goalGauge } = store.createRecord('all-the-fragments');

    //@ts-expect-error
    set(goalGauge, 'metadata', { metricCid: 'cid_rupees' });

    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when metricCid in config but baseline and goal do not exists config'
    );

    set(goalGauge, 'metadata', {
      metricCid: 'cid_rupees',
      baselineValue: 34,
      goalValue: 50
    });
    assert.ok(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is valid when baseline and goal exist in the config and the metric exists in the request'
    );

    set(goalGauge, 'metadata', {
      metricCid: 'cid_rupees',
      //@ts-expect-error
      baselineValue: 'e',
      goalValue: 50
    });
    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when baseline is not a number'
    );

    set(goalGauge, 'metadata', {
      metricCid: 'cid_rupees',
      baselineValue: 34,
      //@ts-expect-error
      goalValue: 'abc'
    });
    assert.notOk(goalGauge.isValidForRequest(request), 'config for goal gauge is invalid when goal is not a number');

    request = buildTestRequest(
      [
        { field: 'swords', parameters: {}, cid: 'cid_swords' },
        { field: 'hp', parameters: {}, cid: 'cid_hp' }
      ],
      []
    );
    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when metric in config does not exist in request'
    );
  });

  test('rebuildConfig', function(assert) {
    let request = buildTestRequest([{ field: 'rupees', cid: 'cid_rupees', parameters: {} }], []),
      requestWithParams = buildTestRequest(
        [{ field: 'revenue', cid: 'cid_revenue', parameters: { currency: 'HYR' } }],
        []
      ),
      response = { rows: [{ rupees: 10 }], meta: {} },
      responseWithParams = { rows: [{ 'revenue(currency=HYR)': 10 }], meta: {} };
    const store = this.owner.lookup('service:store') as StoreService;
    let goalGauge = store.createRecord('all-the-fragments').goalGauge;
    let orginalConfig = goalGauge.toJSON(),
      //@ts-expect-error
      blankConfig = goalGauge.rebuildConfig().toJSON(),
      newConfig = goalGauge.rebuildConfig(request, { rows: [{ rupees: 10 }], meta: {} }).toJSON(),
      paramConfig = goalGauge.rebuildConfig(requestWithParams, responseWithParams).toJSON(),
      expectedConfig = {
        metadata: {
          baselineValue: 9,
          goalValue: 11,
          metricCid: 'cid_rupees'
        },
        type: 'goal-gauge',
        version: 2
      },
      expectedFloatConfig = {
        metadata: {
          baselineValue: 0.9,
          goalValue: 1.1,
          metricCid: 'cid_rupees'
        },
        type: 'goal-gauge',
        version: 2
      },
      expectedNegativeConfig = {
        metadata: {
          baselineValue: -11,
          goalValue: -9,
          metricCid: 'cid_rupees'
        },
        type: 'goal-gauge',
        version: 2
      },
      expectedZeroConfig = {
        metadata: {
          baselineValue: 0,
          goalValue: 1,
          metricCid: 'cid_rupees'
        },
        type: 'goal-gauge',
        version: 2
      },
      expectedParamConfig = {
        metadata: {
          baselineValue: 9,
          goalValue: 11,
          metricCid: 'cid_revenue'
        },
        type: 'goal-gauge',
        version: 2
      };
    // positive integer
    assert.deepEqual(
      blankConfig,
      orginalConfig,
      'returns original config if no request or response is sent to rebuildConfig'
    );
    assert.deepEqual(newConfig, expectedConfig, 'rebuilds config based on request');
    assert.deepEqual(
      paramConfig,
      expectedParamConfig,
      'rebuilds config based on request with parameterized metrics correctly'
    );

    // decimal
    response = { rows: [{ rupees: 1 }], meta: {} };
    newConfig = goalGauge.rebuildConfig(request, response).toJSON();
    assert.deepEqual(newConfig, expectedFloatConfig, 'rebuilds config based on request with decimal metric');

    // negative integer
    response = { rows: [{ rupees: -10 }], meta: {} };
    newConfig = goalGauge.rebuildConfig(request, response).toJSON();
    assert.deepEqual(newConfig, expectedNegativeConfig, 'rebuilds config based on request with negative metric');

    // zero
    response = { rows: [{ rupees: 0 }], meta: {} };
    newConfig = goalGauge.rebuildConfig(request, response).toJSON();
    assert.deepEqual(newConfig, expectedZeroConfig, 'rebuilds config based on request with zero metric');
  });
});
