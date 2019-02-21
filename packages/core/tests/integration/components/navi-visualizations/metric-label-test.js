import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';

module('Integration | Component | navi-visualization/metric-label', function(hooks) {
  setupRenderingTest(hooks);

  test('metric label renders correctly', async function(assert) {
    assert.expect(2);
    set(this, 'metric', { metric: 'magic', parameters: {} });

    _setModel(this, { magic: 30 });
    await render(hbs`
      {{navi-visualizations/metric-label
          model=model
          options=(hash
              description='Magic Points (MP)'
              metric=metric
          )
        }}
      `);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders correctly when model has multiple metrics', async function(assert) {
    assert.expect(2);
    set(this, 'metric', { metric: 'magic', parameters: {} });

    _setModel(this, { magic: 30, hp: 40 });
    await render(hbs`
      {{navi-visualizations/metric-label
          model=model
          options=(hash
              description='Magic Points (MP)'
              metric=metric
          )
        }}
      `);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders formatted string when format not null', async function(assert) {
    assert.expect(1);

    set(this, 'metric', { metric: 'rupees', parameters: {} });
    _setModel(this, { rupees: 1000000 });
    await render(hbs`
      {{navi-visualizations/metric-label
              model=model
              options=(hash
                  description='Rupees'
                  metric=metric
                  format='$ 0,0[.]00'
              )
        }}
      `);
    assert.dom('.metric-label-vis__value').hasText('$ 1,000,000', 'metric value is formatted correctly');
  });

  /**
   * Set the test context model property with a model object
   * @function _setModel
   * @param {Object} context - test context
   * @param {Object} row - object containing row of data
   * @return {Void}
   */
  function _setModel(context, row) {
    context.set('model', A([{ response: { rows: [row] } }]));
  }
});
