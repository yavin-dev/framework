import { run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { clickTrigger as toggleSelector, nativeMouseUp as toggleOption } from 'ember-power-select/test-support/helpers';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { get } from '@ember/object';

let MetadataService;

let Template = hbs`
  {{visualization-config/wrapper
    response=response
    request=request
    visualization=visualization
    onUpdateConfig=(action onUpdateChartConfig)
  }}`;

module('Integration | Component | visualization config/warpper', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();

    // mocking viz-config component
    this.owner.register(
      'component:visualization-config/mock',
      Component.extend({
        classNames: ['mock'],
        click() {
          const handleUpdateConfig = this.onUpdateConfig;
          if (handleUpdateConfig) handleUpdateConfig('foo');
        }
      }),
      { instantiate: false }
    );

    this.set('visualization', {
      type: 'mock',
      metadata: {}
    });

    this.set('onUpdateChartConfig', () => null);

    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('component renders', async function(assert) {
    assert.expect(2);

    await render(Template);

    assert
      .dom('.visualization-config .visualization-config__contents.mock')
      .exists('The Mock component is correctly rendered based on visualization type');

    assert
      .dom('.visualization-config .metric-select')
      .doesNotExist('The metric selector is not rendered for `mock` type');
  });

  test('metric selector', async function(assert) {
    assert.expect(5);

    this.owner.register(
      'manifest:line-chart',
      EmberObject.extend({
        hasMultipleMetrics() {
          return true;
        }
      })
    );

    this.owner.register(
      'manifest:pie-chart',
      EmberObject.extend({
        hasMultipleMetrics() {
          return true;
        }
      })
    );

    this.owner.register(
      'component:visualization-config/line-chart',
      Component.extend({}),
      { instantiate: false }
    );

    this.owner.register(
      'component:visualization-config/pie-chart',
      Component.extend({}),
      { instantiate: false }
    );

    this.set('request', {
      metrics: [
        {
          metric: 'metric1',
          parameters: {},
          canonicalName: 'metric1',
          toJSON() {
            return this;
          }
        },
        {
          metric: 'metric2',
          parameters: {},
          canonicalName: 'metric2',
          toJSON() {
            return this;
          }
        },
        {
          metric: 'revenue',
          parameters: { currency: 'USD' },
          canonicalName: 'revenue(currency=USD)',
          toJSON() {
            return this;
          }
        }
      ]
    });

    this.set('visualization', {
      type: 'line-chart',
      metadata: {
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metric: 'foo'
              }
            }
          }
        }
      }
    });

    await render(Template);

    assert
      .dom('.visualization-config .metric-select')
      .exists('The metric selector component is rendered correctly for line chart');

    this.set('onUpdateChartConfig', config => {
      assert.deepEqual(
        get(config, 'axis.y.series.config.metric.canonicalName'),
        'metric2',
        'Metric 2 is selected and passed on to onUpdateChartMetric with correct series path for line chart'
      );
    });

    await toggleSelector('.metric-select__select__selector');

    assert
      .dom('.metric-select__select__selector .ember-power-select-option[data-option-index="2"]')
      .hasText('Revenue (USD)', 'Parameterized metric is displayed correctly in the dimension visualization config');

    await toggleOption(
      find('.metric-select__select__selector .ember-power-select-option[data-option-index="1"]')
    );

    this.set('visualization', {
      type: 'pie-chart',
      metadata: {
        series: {
          type: 'dimension',
          config: {
            metric: 'foo'
          }
        }
      }
    });

    await render(Template);

    assert
      .dom('.visualization-config .metric-select')
      .exists('The metric selector component is rendered correctly for pie chart');

    this.set('onUpdateChartConfig', config => {
      assert.deepEqual(
        get(config, 'series.config.metric.canonicalName'),
        'metric2',
        'Metric 2 is selected and passed on to onUpdateChartMetric with correct series path for pie chart'
      );
    });

    await toggleSelector('.metric-select__select__selector');

    await toggleOption(
      find('.metric-select__select__selector .ember-power-select-option[data-option-index="1"]')
    );
  });

  test('onUpdateChartConfig', async function(assert) {
    assert.expect(1);

    this.set('onUpdateChartConfig', result => {
      assert.equal(result, 'foo', 'onUpdateChartConfig action is called by the mock component');
    });

    await render(Template);

    await run(() => click('.visualization-config .visualization-config__contents.mock'));
  });
});
