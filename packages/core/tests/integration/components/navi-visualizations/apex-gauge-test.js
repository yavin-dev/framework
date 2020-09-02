import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@ember/test-helpers';
import Component from '@ember/component';
import { A } from '@ember/array';

const TEMPLATE = hbs`
  {{#test-container as |test-container|}}
    <div class='test-view'>
      <div class='test-view__visualization-container'>
        <NaviVisualizations::ApexGauge
          @model={{this.model}}
          @options={{this.options}}
          @containerComponent={{test-container}}
        />
      </div>
    </div>
  {{/test-container}}`;

module('Integration | Component | Navi Visualization - Apex-Gauge', function(hooks) {
  setupRenderingTest(hooks);

  test('apex gauge at 70% has correct color and values', async function(assert) {
    assert.expect(3);
    setUp(this, 'jeNeSaisPas', 'Je Ne Sais Pas', 0, 100000000000, 70000000000);
    await render(TEMPLATE);
    // denali-status red = #ea0000 = rgba(234, 0, 0, X)
    assert.dom('.apexcharts-radial-series path').hasAttribute('stroke', 'rgba(234,0,0,0.85)', 'gauge at 70% is red');
    assert.dom('.apexcharts-datalabel-label').hasText('70B', 'gauge shows correctly formatted value for billions');
    assert.dom('.apexcharts-datalabel-value').hasText('Je Ne Sais Pas', 'gauge renders correct metric label');
  });

  test('apex gauge at 80%', async function(assert) {
    assert.expect(3);
    setUp(this, 'obscureMetric', 'Obscure Metric', 2900000, 3100000, 3060000);
    await render(TEMPLATE);
    // denali-status yellow = #f4cb00 = rgba(244, 203, 0, X)
    assert
      .dom('.apexcharts-radial-series path')
      .hasAttribute('stroke', 'rgba(244,203,0,0.85)', 'gauge at 80% is yellow');
    assert.dom('.apexcharts-datalabel-label').hasText('3.06M', 'gauge shows correctly formatted value for millions');
    assert.dom('.apexcharts-datalabel-value').hasText('Obscure Metric', 'gauge renders correct metric label');
  });

  test('apex gauge at 90%', async function(assert) {
    assert.expect(3);
    setUp(this, 'scoobyDoo', 'Scooby Doo', 0, 100000, 90000);
    await render(TEMPLATE);
    // denali-status green = #15c046 = rgba(21, 192, 70, X)
    assert
      .dom('.apexcharts-radial-series path')
      .hasAttribute('stroke', 'rgba(21,192,70,0.85)', 'gauge is green at 90%');
    assert.dom('.apexcharts-datalabel-label').hasText('90K', 'gauge shows correctly formatted value for thousands');
    assert.dom('.apexcharts-datalabel-value').hasText('Scooby Doo', 'gauge renders correct metric label');
  });

  function setUp(context, metricId, metricName, baselineValue, goalValue, actualValue) {
    context.set(
      'model',
      A([
        {
          request: {
            metrics: {
              0: {
                metric: metricId
              }
            }
          },
          response: {
            rows: [
              {
                [metricId]: actualValue
              }
            ]
          }
        }
      ])
    );
    context.set('options', {
      series: {
        config: {
          baselineValue: baselineValue,
          goalValue: goalValue,
          metrics: {
            id: metricId,
            name: metricName
          }
        }
      }
    });
    let testContainer = Component.extend({
      classNames: ['visualization-container'],
      layout: hbs`{{yield this}}`
    });
    context.owner.register('component:test-container', testContainer);
  }
});
