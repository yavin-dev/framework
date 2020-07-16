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
    // checks correct color: red = #f05050 = rgba(240, 80, 80, X)
    assert.equal(
      this.element.querySelector('.apexcharts-radial-series path').getAttribute('stroke'),
      'rgba(240,80,80,0.85)'
    );
    // checks correct labels:
    assert.equal(this.element.querySelector('.apexcharts-datalabel-label').textContent, '70B');
    assert.equal(this.element.querySelector('.apexcharts-datalabel-value').textContent, '70%');
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
    assert.equal(
      this.element.querySelector('.apexcharts-radial-series path').getAttribute('stroke'),
      'rgba(255,200,49,0.85)'
    );
    assert.equal(this.element.querySelector('.apexcharts-datalabel-label').textContent, '3.06M');
    assert.equal(this.element.querySelector('.apexcharts-datalabel-value').textContent, '80%');
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
    assert.equal(
      this.element.querySelector('.apexcharts-radial-series path').getAttribute('stroke'),
      'rgba(68,184,118,0.85)'
    );
    assert.equal(this.element.querySelector('.apexcharts-datalabel-label').textContent, '90K');
    assert.equal(this.element.querySelector('.apexcharts-datalabel-value').textContent, '90%');
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
