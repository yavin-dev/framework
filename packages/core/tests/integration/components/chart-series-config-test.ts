import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext } from 'ember-test-helpers';
import { buildTestRequest } from 'dummy/tests/helpers/request';

const TEMPLATE = hbs`
<ChartSeriesConfig
  @seriesConfig={{this.seriesConfig}}
  @seriesType={{this.seriesType}}
  @onUpdateConfig={{this.onUpdateConfig}}
  @request={{this.request}}
/>`;

const SERIES_CONFIG = {
  dimensions: [{ name: 'Property 1' }, { name: 'Property 2' }, { name: 'Property 3' }, { name: 'Property 4' }],
};

module('Integration | Component | chart series config', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    this.setProperties({
      seriesType: 'dimension',
      seriesConfig: SERIES_CONFIG,
      onUpdateConfig: () => null,
      request: buildTestRequest([
        { field: 'adClicks' },
        { field: 'revenue', parameters: { currency: 'CAD' } },
        { field: 'revenue', parameters: { currency: 'EUR' } },
      ]),
    });

    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('Component renders', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.dom('.line-chart-config__series-config').exists('The chart series config component is rendered');
  });

  test('Component renders dimensions correctly', async function (assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.line-chart-config__series-config__item__content').map((el) => el.textContent?.trim()),
      ['Property 1', 'Property 2', 'Property 3', 'Property 4'],
      'Component renders dimension names correctly'
    );
  });

  test('Component renders formatted metrics correctly', async function (assert) {
    assert.expect(1);

    this.setProperties({
      isOpen: true,
      seriesType: 'metric',
    });

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.line-chart-config__series-config__item__content').map((el) => el.textContent?.trim()),
      ['Ad Clicks', 'Revenue (CAD)', 'Revenue (EUR)'],
      'Component renders metric names correctly'
    );
  });
});
