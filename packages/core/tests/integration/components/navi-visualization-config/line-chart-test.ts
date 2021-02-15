import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, find, render, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext } from 'ember-test-helpers';
import BaseVisualizationManifest from 'navi-core/navi-visualization-manifests/base';

const Template = hbs`
  <NaviVisualizationConfig::LineChart
    @response={{this.response}}
    @request={{this.request}}
    @options={{this.options}}
    @type={{this.type}}
    @onUpdateConfig={{this.onUpdateConfig}}
  />`;
const request = {
  hasGroupBy: true,
  hasMultipleMetrics: true,
  columns: []
};
type MockRequest = typeof request;

const chartOptions = {
  style: {},
  axis: {
    y: {
      series: {
        type: 'mock',
        config: {}
      }
    }
  }
};

module('Integration | Component | visualization config/line chart', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    //mocking visualization manifest
    this.owner.register(
      'navi-visualization-manifest:mock',
      class extends BaseVisualizationManifest {
        //@ts-expect-error
        hasGroupBy(request: MockRequest) {
          return request.hasGroupBy;
        }

        //@ts-expect-error
        hasMultipleMetrics(request: MockRequest) {
          return request.hasMultipleMetrics;
        }
      }
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
    assert.expect(6);

    await render(Template);

    assert.dom('.denali-switch').isVisible('The `stacked` option is correctly rendered based on request');

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isNotVisible('The series config component is not rendered when `stacked` option is off');

    this.set('options.style', { stacked: true });

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isVisible('The series config component is rendered when `stacked` option is on');

    await click('.line-chart-config__stacked-opt-select');
    assert.dom('.line-chart-config__stacked-opt-select').isNotChecked('Stacked toggle is checked');

    this.set('request', {
      hasGroupBy: false,
      hasMultipleMetrics: false,
      columns: []
    });

    await render(Template);

    assert
      .dom('.line-chart-config .line-chart-config__stacked-opt-select')
      .isNotVisible('The `stacked` option is correctly hidden based on request');

    assert
      .dom('.line-chart-config .line-chart-config__series-config')
      .isNotVisible('The series config component is correctly hidden based on request');
  });
});
