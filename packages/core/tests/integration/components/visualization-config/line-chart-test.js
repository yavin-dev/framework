import { run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { get } from '@ember/object';

let Template = hbs`
  {{visualization-config/line-chart
    response=response
    request=request
    options=options
    type=type
    onUpdateConfig=(action onUpdateConfig)
  }}`,
  request = {
    hasGroupBy: true,
    hasMultipleMetrics: true
  },
  chartOptions = {
    style: {},
    axis: {
      y: {
        series: {
          type: 'mock'
        }
      }
    }
  };

module('Integration | Component | visualization config/line chart', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    //mocking visualization manifest
    this.owner.register(
      'manifest:mock',
      EmberObject.extend({
        hasGroupBy(request) {
          return request.hasGroupBy;
        },

        hasMultipleMetrics(request) {
          return request.hasMultipleMetrics;
        }
      })
    );

    //mocking line chart type component
    this.owner.register(
      'component:visualization-config/chart-type/mock',
      Component.extend({
        classNames: ['mock'],
        click() {
          const handleUpdateConfig = get(this, 'onUpdateConfig');

          if (handleUpdateConfig) handleUpdateConfig(chartOptions);
        }
      }),
      { instantiate: false }
    );

    this.set('type', 'mock');
    this.set('request', request);
    this.set('options', chartOptions);
    this.set('onUpdateConfig', () => null);
  });

  test('component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert
      .dom('.line-chart-config .mock')
      .exists('The Mock component is correctly rendered based on visualization type');
  });

  test('onUpdateConfig', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.deepEqual(result, chartOptions, 'onUpdateConfig action is called by the mock component');
    });

    await render(Template);

    await run(() => click('.mock'));
  });

  test('showStackOption', async function(assert) {
    assert.expect(5);

    await render(Template);

    assert
      .dom('.line-chart-config .line-chart-config__stacked-opt')
      .isVisible('The `stacked` option is correctly rendered based on request');

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isNotVisible('The series config component is not rendered when `stacked` option is off');

    this.set('options.style', { stacked: true });

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isVisible('The series config component is rendered when `stacked` option is on');

    this.set('request', {
      hasGroupBy: false,
      hasMultipleMetrics: false
    });

    await render(Template);

    assert
      .dom('.line-chart-config .line-chart-config__stacked-opt')
      .isNotVisible('The `stacked` option is correctly hidden based on request');

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isNotVisible('The series config component is correctly hidden based on request');
  });
});
