import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Apex-Gauge', function(hooks) {
  setupTest(hooks);

  test('rebuildConfig formats correctly', function(assert) {
    assert.expect(2);
    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('apexGauge');
    const request = {
      metrics: { content: [{ metric: { id: 'circle', name: 'Circle' } }] }
    };
    const rows = [{ circle: 360 }];
    const config = chart.rebuildConfig(request, { rows }).toJSON();
    assert.deepEqual(
      config,
      {
        type: 'apex-gauge',
        version: 1,
        metadata: {
          series: {
            config: {
              baselineValue: 0,
              goalValue: 720,
              metrics: { id: 'circle', name: 'Circle' }
            }
          }
        }
      },
      'config formats correctly for one metric with no dimensions'
    );
    assert.ok(chart.isValidForRequest(request), 'apex-gauge validates for single-metric no-dimension requests');
  });

  test('no-metric, multi-metric, and dimension requests fail', function(assert) {
    assert.expect(3);
    const chart = this.owner
      .lookup('service:store')
      .createRecord('all-the-fragments')
      .get('apexGauge');
    let request = { metrics: { content: [] } };
    assert.notOk(chart.isValidForRequest(request), 'apex-gauge invalid for no-metric requests');
    request = {
      metrics: { content: [{ metric: { id: 'circle', name: 'Circle' } }, { metric: { id: 'square', name: 'Square' } }] }
    };
    assert.notOk(chart.isValidForRequest(request), 'apex-gauge invalid for multiple-metric requests');
    request = {
      dimensions: { content: [{ dimension: { id: 'shape', name: 'Shape' } }] },
      metrics: { content: [{ metric: { id: 'circle', name: 'Circle' } }] }
    };
    assert.notOk(chart.isValidForRequest(request), 'apex-gauge invalid for dimension requests');
  });
});
