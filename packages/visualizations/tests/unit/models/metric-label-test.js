import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';
import { buildTestRequest } from '../../helpers/request';

const { run, set } = Ember;

moduleForModel('all-the-fragments', 'Unit | Model | Metric Label Visualization Fragment', {
  needs: [
    'model:metric-label',
    'validator:request-metric-exist',
  ]
});

test('isValidForRequest', function(assert) {
  assert.expect(2);

  let request = buildTestRequest(['rupees'], []),
      metricLabel = run(() => this.subject().get('metricLabel'));

  run(() => set(metricLabel, 'metadata', { format: '0a', metric: 'rupees' }));
  assert.ok(metricLabel.isValidForRequest(request),
    'config for metric label is valid when metric in config exists in request');

  request = buildTestRequest(['swords', 'hp'], []);
  assert.notOk(metricLabel.isValidForRequest(request),
    'config for metric label is invalid when metric in config does not exist in request');
});

test('is Valid for Parameterized Metric Request', function(assert) {
  assert.expect(2);

  let request = buildTestRequest([{metric: 'revenue', parameters: {currency: 'HYR'}}], []),
      metricLabel = run(() => this.subject().get('metricLabel'));

  run(() => set(metricLabel, 'metadata', { format: '0a', metric: 'revenue(currency=HYR)' }));
  assert.ok(metricLabel.isValidForRequest(request),
    'config for metric label is valid when metric in config exists in request');

  request = buildTestRequest([{metric: 'revenue', parameters: {currency: 'USD'}}, 'hp'], []);
  assert.notOk(metricLabel.isValidForRequest(request),
    'config for metric label is invalid when metric in config does not exist in request');
});

test('rebuildConfig', function(assert) {
  let rows = [
    { rupees: 999, hp: 0}
  ];

  let metricLabel = run(() => this.subject().get('metricLabel'));

  let request = buildTestRequest(['rupees', 'hp'], []),
      config = run(() => metricLabel.rebuildConfig(request, { rows }).toJSON());

  assert.deepEqual(config, {
    metadata: {
      metric: 'rupees',
      format: '0,0.00',
      description: 'Rupees'
    },
    type: 'metric-label',
    version: 1
  }, 'config regenerated with metric updated');
});

