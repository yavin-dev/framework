import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';

const TEMPLATE = hbs`
<NaviVisualizationConfig::ApexGauge
  @request={{this.request}}
  @response={{this.response}}
  @options={{this.options}}
  @onUpdateConfig={{this.onUpdateConfig}}
/>`;

module('Integration | Component | navi visualization config - apex-gauge', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('request', {});
    this.set('response', []);
    this.set('options', {
      series: {
        config: {
          baselineValue: 0,
          goalValue: 3000,
          dimensions: [],
          metrics: [{ id: 'shambala', name: 'Strange WiFi' }]
        }
      }
    });
    this.set('onUpdateConfig', function() {
      return null;
    });
  });

  test('chart options section renders', async function(assert) {
    assert.expect(6);
    await render(TEMPLATE);
    assert.dom('.apex-gauge-config').exists();
    assert
      .dom('.apex-gauge-config__chart-options-section__header')
      .hasText('Chart Options:', 'chart options section renders');
    assert
      .dom('.apex-gauge-config__chart-options-section__baselineValue-change__label')
      .hasText('Baseline Value:', 'baseline value label renders');
    assert
      .dom('.apex-gauge-config__chart-options-section__baselineValue-change__input')
      .hasValue('0', 'baseline value renders correct initial value');
    assert
      .dom('.apex-gauge-config__chart-options-section__goalValue-change__label')
      .hasText('Goal Value:', 'goal value label renders');
    assert
      .dom('.apex-gauge-config__chart-options-section__goalValue-change__input')
      .hasValue('3000', 'goal value renders corrdect initial value');
  });
});
