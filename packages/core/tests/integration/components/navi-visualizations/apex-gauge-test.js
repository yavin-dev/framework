import { A as arr } from '@ember/array';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | apex-gauge ', function(hooks) {
  setupRenderingTest(hooks);

  test('apex gauge at 70%', async function(assert) {
    assert.expect(3);
    _setModel(this, 'pageViews', 70000000000);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
    {{navi-visualizations/apex-gauge
        model=model
        options=(hash
          baselineValue=0
          goalValue=100000000000
          metric=metric
        )
      }}
    `);
    // red = #f05050 = rgba(240, 80, 80, X)
    assert.dom('.apexcharts-radial-series path').hasAttribute('stroke', 'rgba(240,80,80,0.85)');
    assert.dom('.apexcharts-datalabel-label').hasText('70B');
    assert.dom('.apexcharts-datalabel-value').hasText('70%');
  });

  test('apex gauge at 80%', async function(assert) {
    assert.expect(3);
    _setModel(this, 'pageViews', 3060000);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
    {{navi-visualizations/apex-gauge
        model=model
        options=(hash
          baselineValue=2900000
          goalValue=3100000
          metric=metric
        )
      }}
    `);
    // yellow = #ffc831 = rgba(255, 200, 49, X)
    assert.dom('.apexcharts-radial-series path').hasAttribute('stroke', 'rgba(255,200,49,0.85)');
    assert.dom('.apexcharts-datalabel-label').hasText('3.06M');
    assert.dom('.apexcharts-datalabel-value').hasText('80%');
  });

  test('apex gauge at 90%', async function(assert) {
    assert.expect(3);
    _setModel(this, 'pageViews', 90000);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
    {{navi-visualizations/apex-gauge
        model=model
        options=(hash
          baselineValue=0
          goalValue=100000
          metric=metric
        )
      }}
    `);
    // green = #44b876 = rgba(68, 184, 118, X)
    assert.dom('.apexcharts-radial-series path').hasAttribute('stroke', 'rgba(68,184,118,0.85)');
    assert.dom('.apexcharts-datalabel-label').hasText('90K');
    assert.dom('.apexcharts-datalabel-value').hasText('90%');
  });

  /**
   * Set the test context model property with a model object
   * @function _setModel
   * @param {Object} context - test context
   * @param {String} metric - metric name
   * @param {Number} value - value of metric
   * @return {Void}
   */
  function _setModel(context, metric, value, dataSource = 'dummy') {
    context.set(
      'model',
      arr([
        {
          response: { rows: [{ [metric]: value }] },
          request: { metrics: [{ metric }], dataSource }
        }
      ])
    );
  }
});
