import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { get } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from 'ember-tooltips/test-support';
import config from 'ember-get-config';
import { clickItem, clickItemFilter, getAll, getItem, renderAll } from 'navi-reports/test-support/report-builder';

let Store, MetadataService, AdClicks;

const TEMPLATE = hbs`<MetricSelector
  @request={{this.request}}
  @onAddMetric={{this.addMetric}}
  @onRemoveMetric={{this.removeMetric}}
  @onToggleMetricFilter={{this.addMetricFilter}}
/>`;

module('Integration | Component | metric selector', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:navi-metadata');

    this.owner.register(
      'helper:update-report-action',
      buildHelper(() => {}),
      { instantiate: false }
    );
    this.owner.register(
      'helper:can-having',
      buildHelper(([metric]) => {
        return get(metric, 'id') !== 'regUsers';
      }),
      { instantiate: false }
    );

    this.set('addMetric', () => {});
    this.set('removeMetric', () => {});
    this.set('addMetricFilter', () => {});

    await MetadataService.loadMetadata();
    AdClicks = MetadataService.getById('metric', 'adClicks', 'bardOne');
    //set report object
    this.set(
      'request',
      Store.createFragment('bard-request/request', {
        logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
          table: MetadataService.getById('table', 'tableA', 'bardOne'),
          timeGrain: 'day'
        }),
        metrics: [
          {
            metric: AdClicks,
            parameters: {
              adType: 'BannerAds'
            }
          },
          {
            metric: AdClicks,
            parameters: {
              adType: 'VideoAds'
            }
          }
        ],
        having: A([{ metric: { metric: AdClicks } }]),
        responseFormat: 'csv'
      })
    );
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assert.dom('.checkbox-selector--metric').isVisible('The metric selector component is rendered');

    assert
      .dom('.navi-list-selector')
      .isVisible('a navi-list-selector component is rendered as part of the metric selector');

    assert.dom('.grouped-list').isVisible('a grouped-list component is rendered as part of the metric selector');
  });

  test('show selected', async function(assert) {
    assert.expect(1);

    await render(TEMPLATE);

    assert.dom('.navi-list-selector__show-link').doesNotExist('Show Selected toggle is hidden');
  });

  test('add and remove metric actions', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    this.set('addMetric', metric => {
      assert.equal(metric.get('name'), 'Total Clicks', 'the clicked metric is passed as a param to the action');
    });

    this.set('removeMetric', () => assert.notOk(true, 'removeMetric is not called'));

    await render(TEMPLATE);

    //add total clicks
    await clickItem('metric', 'Total Clicks');

    //clicking again adds when feature flag is on
    await clickItem('metric', 'Total Clicks');
  });

  test('filter icon', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    let { item: adClicksItem, reset: adClicksReset } = await getItem('metric', 'Ad Clicks');
    assert.ok(
      adClicksItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the adclicks metric has the active class'
    );
    await adClicksReset();

    let { item: totalClicksItem, reset: totalClicksReset } = await getItem('metric', 'Total Clicks');
    assert.notOk(
      totalClicksItem.querySelector('.grouped-list__filter--active'),
      'The filter icon with the total clicks metric does not have the active class'
    );
    await totalClicksReset();

    this.set('addMetricFilter', metric => {
      assert.deepEqual(metric, AdClicks, 'The adclicks metric is passed to the action when filter icon is clicked');
    });

    await clickItemFilter('metric', 'Ad Clicks');
  });

  test('tooltip', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    assertTooltipNotRendered(assert);
    this.server.get(`${config.navi.dataSources[0].uri}/v1/metrics/adClicks`, function() {
      return {
        category: 'Clicks',
        name: 'adClicks',
        longName: 'Ad Clicks',
        type: 'number',
        description: 'foo'
      };
    });

    // triggerTooltipTargetEvent will not work for hidden elementc
    const { item } = await getItem('metric', 'Ad Clicks');
    await triggerEvent(item.querySelector('.grouped-list__item-info'), 'mouseenter');

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'foo'
    });
  });

  test('ranked search', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    const tableMetrics = MetadataService.getById('table', 'tableA', 'bardOne').metrics;

    // Sort by category then by name
    const groupedSortedMetrics = A(tableMetrics.filter(m => m.name.includes('Page')))
      .sortBy('name')
      .reduce((acc, metric) => {
        const { category: cat, name } = metric;
        acc[cat] = acc[cat] ? [...acc[cat], name] : [name];
        return acc;
      }, {});
    const expectedPageResults = Object.values(groupedSortedMetrics).flat();

    const pageResults = (await getAll('metric')).filter(item => item.includes('Page'));
    assert.deepEqual(
      pageResults,
      expectedPageResults,
      'Initially the page view metrics are ordered alphabetically by category and name'
    );

    const searchPageResults = await getAll('metric', 'Page');

    assert.deepEqual(
      searchPageResults,
      [
        'Page Views',
        'Total Page Views',
        'Additive Page Views',
        'Page Views (Daily Avg)',
        'Total Page Views (Daily Avg)',
        'Additive Page Views (Daily Avg)',
        'Total Page Views WoW',
        'Page Views per Unique Identifier',
        'Total Page Views per Unique Identifier',
        'Additive Page Views per Unique Identifier',
        'Page Views per Unique Identifier (Daily Avg)',
        'Total Page Views per Unique Identifier (Daily Avg)',
        'Additive Page Views per Unique Identifier (Daily Avg)'
      ],
      'The search results are ranked based on relevance'
    );
  });

  test('hide filter if metric not allowed to show filter on base metric', async function(assert) {
    assert.expect(3);

    await render(TEMPLATE);

    const resetRenderAll = await renderAll('metric');
    assert.dom('.grouped-list__icon-set--no-filter').exists({ count: 1 });
    assert.dom('.grouped-list__icon-set--no-filter .grouped-list__filter').doesNotExist();
    assert.dom('.grouped-list__icon-set .grouped-list__filter').exists();
    await resetRenderAll();
  });
});
