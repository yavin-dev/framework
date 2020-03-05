import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import { buildTestRequest } from '../../helpers/request';

module('Unit | Model | Gauge Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('isValidForRequest', function(assert) {
    assert.expect(6);

    let request = buildTestRequest([{ metric: 'rupees', parameters: {} }], []),
      goalGauge = run(() =>
        run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('goalGauge')
      );

    run(() =>
      set(goalGauge, 'metadata', {
        metric: {
          metric: {
            category: 'category',
            name: 'Rupees',
            id: 'rupees'
          },
          parameters: {},
          canonicalName: 'rupees'
        }
      })
    );
    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when metric in config but baseline and goal do not exists config'
    );

    run(() =>
      set(goalGauge, 'metadata', {
        metric: {
          metric: {
            category: 'category',
            name: 'Rupees',
            id: 'rupees'
          },
          parameters: {},
          canonicalName: 'rupees'
        },
        baselineValue: 34,
        goalValue: 50
      })
    );
    assert.ok(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is valid when baseline and goal exist in the config and the metric exists in the request'
    );

    run(() =>
      set(goalGauge, 'metadata', {
        metric: {
          metric: {
            category: 'category',
            name: 'Rupees',
            id: 'rupees'
          },
          parameters: {},
          canonicalName: 'rupees'
        },
        baselineValue: '34',
        goalValue: '50'
      })
    );
    assert.ok(
      goalGauge.isValidForRequest(request),
      'in order to support web service response, config values can contain string representations of numbers'
    );

    run(() =>
      set(goalGauge, 'metadata', {
        metric: {
          metric: {
            category: 'category',
            name: 'Rupees',
            id: 'rupees'
          },
          parameters: {},
          canonicalName: 'rupees'
        },
        baselineValue: 'e',
        goalValue: 50
      })
    );
    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when baseline is not a number'
    );

    run(() =>
      set(goalGauge, 'metadata', {
        metric: {
          metric: {
            category: 'category',
            name: 'Rupees',
            id: 'rupees'
          },
          parameters: {},
          canonicalName: 'rupees'
        },
        baselineValue: 34,
        goalValue: 'abc'
      })
    );
    assert.notOk(goalGauge.isValidForRequest(request), 'config for goal gauge is invalid when goal is not a number');

    request = buildTestRequest(
      [
        { metric: 'swords', parameters: {}, canonicalName: 'swords' },
        { metric: 'hp', parameters: {}, canonicalName: 'hp' }
      ],
      []
    );
    assert.notOk(
      goalGauge.isValidForRequest(request),
      'config for goal gauge is invalid when metric in config does not exist in request'
    );
  });

  test('rebuildConfig', function(assert) {
    assert.expect(6);

    let request = buildTestRequest([{ metric: 'rupees', parameters: {} }], []),
      requestWithParams = buildTestRequest([{ metric: 'revenue', parameters: { currency: 'HYR' } }], []),
      response = { rows: [{ rupees: 10 }] },
      responseWithParams = { rows: [{ 'revenue(currency=HYR)': 10 }] },
      gauge = run(() =>
        run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('goalGauge')
      ),
      orginalConfig = gauge.toJSON(),
      blankConfig = run(() => gauge.rebuildConfig().toJSON()),
      newConfig = run(() => gauge.rebuildConfig(request, response).toJSON()),
      paramConfig = run(() => gauge.rebuildConfig(requestWithParams, responseWithParams).toJSON()),
      expectedConfig = {
        metadata: {
          baselineValue: 9,
          goalValue: 11,
          metric: { metric: 'rupees', parameters: {} }
        },
        type: 'goal-gauge',
        version: 1
      },
      expectedFloatConfig = {
        metadata: {
          baselineValue: 0.9,
          goalValue: 1.1,
          metric: { metric: 'rupees', parameters: {} }
        },
        type: 'goal-gauge',
        version: 1
      },
      expectedNegativeConfig = {
        metadata: {
          baselineValue: -11,
          goalValue: -9,
          metric: { metric: 'rupees', parameters: {} }
        },
        type: 'goal-gauge',
        version: 1
      },
      expectedZeroConfig = {
        metadata: {
          baselineValue: 0,
          goalValue: 1,
          metric: { metric: 'rupees', parameters: {} }
        },
        type: 'goal-gauge',
        version: 1
      },
      expectedParamConfig = {
        metadata: {
          baselineValue: 9,
          goalValue: 11,
          metric: { metric: 'revenue', parameters: { currency: 'HYR' } }
        },
        type: 'goal-gauge',
        version: 1
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
    response = { rows: [{ rupees: 1 }] };
    newConfig = run(() => gauge.rebuildConfig(request, response).toJSON());
    assert.deepEqual(newConfig, expectedFloatConfig, 'rebuilds config based on request with decimal metric');

    // negative integer
    response = { rows: [{ rupees: -10 }] };
    newConfig = run(() => gauge.rebuildConfig(request, response).toJSON());
    assert.deepEqual(newConfig, expectedNegativeConfig, 'rebuilds config based on request with negative metric');

    // zero
    response = { rows: [{ rupees: 0 }] };
    newConfig = run(() => gauge.rebuildConfig(request, response).toJSON());
    assert.deepEqual(newConfig, expectedZeroConfig, 'rebuilds config based on request with zero metric');
  });
});
