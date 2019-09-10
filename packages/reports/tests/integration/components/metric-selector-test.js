import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { set, get } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, fillIn, triggerEvent } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from 'ember-tooltips/test-support';

let Store, MetadataService, AdClicks, PageViews;

module('Integration | Component | metric selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    setupMock();

    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });
    this.owner.register(
      'helper:can-having',
      buildHelper(([metric]) => {
        return get(metric, 'name') !== 'regUsers';
      }),
      { instantiate: false }
    );

    this.set('addMetric', () => {});
    this.set('removeMetric', () => {});
    this.set('addMetricFilter', () => {});

    return MetadataService.loadMetadata().then(async () => {
      AdClicks = MetadataService.getById('metric', 'adClicks');
      PageViews = MetadataService.getById('metric', 'pageViews');
      //set report object
      this.set(
        'request',
        Store.createFragment('bard-request/request', {
          logicalTable: Store.createFragment('bard-request/fragments/logicalTable', {
            table: MetadataService.getById('table', 'tableA'),
            timeGrainName: 'day'
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

      await render(hbs`{{metric-selector
            request=request
            onAddMetric=(action addMetric)
            onRemoveMetric=(action removeMetric)
            onToggleMetricFilter=(action addMetricFilter)
          }}`);
    });
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(3);

    assert.dom('.checkbox-selector--metric').isVisible('The metric selector component is rendered');

    assert
      .dom('.navi-list-selector')
      .isVisible('a navi-list-selector component is rendered as part of the metric selector');

    assert.dom('.grouped-list').isVisible('a grouped-list component is rendered as part of the metric selector');
  });

  test('show selected', async function(assert) {
    assert.expect(9);

    assert.ok(
      findAll('.grouped-list__item').length > this.get('request.metrics.length'),
      'Initially all the metrics are shown in the metric selector'
    );

    assert
      .dom('.navi-list-selector__show-link')
      .hasText('Show Selected (1)', 'The Show Selected link has the correct number of selected base metrics shown');

    await click('.navi-list-selector__show-link');

    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['Ad Clicks'],
      'When show selected is clicked only the selected adClicks base metric is shown'
    );

    assert.notOk(
      findAll('.checkbox-selector__checkbox')
        .map(el => el['checked'])
        .includes(false),
      'The selected items are checked'
    );

    let metrics = get(this, 'request.metrics');
    metrics.removeFragment(metrics.toArray()[0]);

    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['Ad Clicks'],
      "Removing one metric while another metric with the same base is still selected does not change 'Show Selected'"
    );

    await click('.navi-list-selector__show-link');

    assert
      .dom('.navi-list-selector__show-link')
      .hasText(
        'Show Selected (1)',
        'The Show Selected link still has the correct number of selected base metrics shown'
      );

    run(() => {
      metrics.createFragment({
        metric: PageViews,
        parameters: 'Param1'
      });
    });

    assert
      .dom('.navi-list-selector__show-link')
      .hasText(
        'Show Selected (2)',
        'The Show Selected link increases the count when a metric with a different base is added'
      );

    await click('.navi-list-selector__show-link');

    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['Ad Clicks', 'Page Views'],
      'Adding a new metric will show its base metric as selected'
    );

    assert.notOk(
      findAll('.checkbox-selector__checkbox')
        .map(el => el['checked'])
        .includes(false),
      'All selected items are checked'
    );
  });

  test('add and remove metric actions', async function(assert) {
    assert.expect(2);

    this.set('addMetric', metric => {
      assert.equal(metric.get('longName'), 'Total Clicks', 'the clicked metric is passed as a param to the action');
    });

    this.set('removeMetric', metric => {
      assert.equal(metric.get('longName'), 'Ad Clicks', 'the clicked metric is passed as a param to the action');
    });

    //select first time grain

    //add total clicks
    await click($('.grouped-list__item:contains(Total Clicks) .grouped-list__item-label')[0]);

    //remove ad clicks
    await click($('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-label')[0]);
  });

  test('filter icon', async function(assert) {
    assert.expect(3);

    assert.notOk(
      isEmpty($('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter--active')),
      'The filter icon with the adclicks metric has the active class'
    );

    assert.ok(
      isEmpty($('.grouped-list__item:contains(Total Clicks) .checkbox-selector__filter--active')),
      'The filter icon with the total clicks metric does not have the active class'
    );

    this.set('addMetricFilter', metric => {
      assert.deepEqual(metric, AdClicks, 'The adclicks metric is passed to the action when filter icon is clicked');
    });

    await click($('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter')[0]);
  });

  test('tooltip', async function(assert) {
    assert.expect(3);

    assertTooltipNotRendered(assert);
    set(AdClicks, 'extended', {
      content: { description: 'foo' }
    });

    await click($('.grouped-list__group-header:contains(Clicks)')[0]);
    // triggerTooltipTargetEvent will not work for hidden elementc
    await triggerEvent($('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-info')[0], 'mouseenter');

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'foo'
    });
  });

  test('metric config for metric with parameters', async function(assert) {
    assert.expect(2);

    assert.ok(
      isEmpty($('.grouped-list__item:contains(Ad Clicks) .metric-config')),
      'The metric config trigger icon is not present for a metric without parameters'
    );

    assert.notOk(
      isEmpty($('.grouped-list__item:contains(Revenue) .metric-config')),
      'The metric config trigger icon is present for a metric with parameters'
    );
  });

  test('ranked search', async function(assert) {
    assert.expect(2);

    assert.deepEqual(
      $('.grouped-list__item:contains(Page)')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Additive Page Views', 'Page Views', 'Total Page Views', 'Total Page Views WoW'],
      'Initially the page view metrics are ordered alphabetically'
    );

    await fillIn('.navi-list-selector__search-input', 'page');
    await triggerEvent('.navi-list-selector__search-input', 'focusout');

    assert.deepEqual(
      findAll('.grouped-list__item').map(el => el.textContent.trim()),
      ['Page Views', 'Total Page Views', 'Additive Page Views', 'Total Page Views WoW'],
      'The search results are ranked based on relevance'
    );
  });

  test('hide filter if metric not allowed to show filter on base metric', function(assert) {
    assert.dom('.metric-selector__icon-set--no-filter').exists({ count: 1 });
    assert.dom('.metric-selector__icon-set--no-filter .metric-selector__filter').doesNotExist();
    assert.dom('.metric-selector__icon-set .metric-selector__filter').exists();
  });
});
