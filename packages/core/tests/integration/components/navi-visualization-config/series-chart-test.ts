/* eslint-disable @typescript-eslint/camelcase */
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { TestContext } from 'ember-test-helpers';
import { buildTestRequest } from 'navi-core/test-support/request';
import { DimensionSeries } from 'navi-core/models/chart-visualization';

let Template = hbs`
<NaviVisualizationConfig::SeriesChart
  @seriesConfig={{this.seriesConfig}}
  @seriesType={{this.seriesType}}
  @response={{this.response}}
  @request={{this.request}}
  @onUpdateConfig={{this.onUpdateChartConfig}}
/>`;

module('Integration | Component | visualization config/series chart', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.set('seriesType', 'dimension');
    this.set('seriesConfig', {
      metricCid: 'cid_adClicks',
      dimensions: [
        { name: 'Foo1', values: { cid_age: '1' } },
        { name: 'Foo2', values: { cid_age: '2' } },
      ],
    });

    this.setProperties({
      request: buildTestRequest(
        [
          { cid: 'cid_adClicks', field: 'adClicks' },
          { cid: 'cid_pageViews', field: 'pageViews' },
          { cid: 'cid_revenue(currency=USD)', field: 'revenue', parameters: { currency: 'USD' } },
        ],
        [],
        { start: 'P7D', end: 'current' },
        'day'
      ),
      response: { rows: [], meta: {} },
      onUpdateChartConfig: () => null,
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('metric selector', async function (assert) {
    assert.expect(4);

    await render(Template);

    assert.dom('.metric-select__select-trigger').exists('The metric selector component is rendered correctly');

    this.set('onUpdateChartConfig', (config: Partial<DimensionSeries['config']>) => {
      assert.deepEqual(
        config.metricCid,
        'cid_pageViews',
        'The second metric is selected and passed on to onUpdateChartConfig'
      );
    });

    await click('.metric-select__select-trigger');
    assert
      .dom('.ember-power-select-option[data-option-index="2"]')
      .hasText('Revenue (USD)', 'Parameterized metric is displayed correctly');

    await selectChoose('.metric-select__select-trigger', 'Page Views');

    this.set('seriesType', 'metric');
    assert
      .dom('.series-chart-config .metric-select')
      .doesNotExist('The metric selector component is not rendered for a metric series');
  });
});
