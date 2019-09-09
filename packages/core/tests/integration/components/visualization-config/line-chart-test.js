import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

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
    hasMultipleMetrics: true,
    dimensions: [],
    metrics: []
  },
  chartOptions = {
    type: 'metric',
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

    this.set('type', 'mock');
    this.set('request', request);
    this.set('options', chartOptions);
    this.set('onUpdateConfig', () => null);
  });

  test('component renders', async function(assert) {
    assert.expect(1);

    await render(Template);

    assert.dom('.line-chart-config').exists('The component is rendered');
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
      hasMultipleMetrics: false,
      dimensions: [],
      metrics: []
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
