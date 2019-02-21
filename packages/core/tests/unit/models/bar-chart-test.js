import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('all-the-fragments', 'Unit | Model | Bar Chart Visualization Fragment', {
  needs: [
    'transform:fragment',
    'validator:length',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain',
    'validator:request-filters',
    'model:bar-chart'
  ]
});

test('Bar chart type', function(assert) {
  assert.expect(1);

  let chart = run(() => this.subject().get('barChart'));
  assert.equal(get(chart, 'type'), 'bar-chart', 'bar chart config has correct chart type');
});
