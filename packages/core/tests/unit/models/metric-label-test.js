import { run } from '@ember/runloop';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { buildTestRequest } from '../../helpers/request';

module('Unit | Model | Metric Label Visualization Fragment', function(hooks) {
  setupTest(hooks);

  test('isValidForRequest', function(assert) {
    assert.expect(2);

    let request = buildTestRequest([{ metric: 'rupees', parameters: {} }], []),
      metricLabel = run(() =>
        run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('metricLabel')
      );

    run(() =>
      set(metricLabel, 'metadata', {
        format: '0a',
        metric: {
          metric: { id: 'rupees', name: 'Rupees', category: 'category' },
          parameters: {},
          canonicalName: 'rupees'
        }
      })
    );
    assert.ok(
      metricLabel.isValidForRequest(request),
      'config for metric label is valid when metric in config exists in request'
    );

    request = buildTestRequest(['swords', 'hp'], []);
    assert.notOk(
      metricLabel.isValidForRequest(request),
      'config for metric label is invalid when metric in config does not exist in request'
    );
  });

  test('is Valid for Parameterized Metric Request', function(assert) {
    assert.expect(2);

    let request = buildTestRequest([{ metric: 'revenue', parameters: { currency: 'HYR' } }], []),
      metricLabel = run(() =>
        run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('metricLabel')
      );

    run(() =>
      set(metricLabel, 'metadata', {
        format: '0a',
        metric: {
          metric: { id: 'revenue', name: 'Revenue', category: 'category' },
          parameters: { currency: 'HYR' },
          canonicalName: 'revenue(currency=HYR)'
        }
      })
    );
    assert.ok(
      metricLabel.isValidForRequest(request),
      'config for metric label is valid when metric in config exists in request'
    );

    request = buildTestRequest([{ metric: 'revenue', parameters: { currency: 'USD' } }, 'hp'], []);
    assert.notOk(
      metricLabel.isValidForRequest(request),
      'config for metric label is invalid when metric in config does not exist in request'
    );
  });

  test('rebuildConfig', function(assert) {
    let rows = [{ rupees: 999, hp: 0 }];

    let metricLabel = run(() =>
      run(() => this.owner.lookup('service:store').createRecord('all-the-fragments')).get('metricLabel')
    );

    let request = buildTestRequest([{ metric: 'rupees', parameters: {} }, { metric: 'hp', parameters: {} }], []),
      config = run(() => metricLabel.rebuildConfig(request, { rows }).toJSON());

    assert.deepEqual(
      config,
      {
        metadata: {
          metric: {
            metric: 'rupees',
            parameters: {}
          },
          format: '0,0.00',
          description: 'Rupees'
        },
        type: 'metric-label',
        version: 1
      },
      'config regenerated with metric updated'
    );
  });
});
