import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { helper as buildHelper } from '@ember/component/helper';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll, fillIn, find, triggerEvent } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { assertTooltipRendered, assertTooltipNotRendered, assertTooltipContent } from '../../helpers/ember-tooltips';

let Store, MetadataService, AdClicks, PageViews;

module('Integration | Component | metric selector', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    setupMock();

    this.owner.register('helper:update-report-action', buildHelper(() => {}), { instantiate: false });

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

  test('it renders', function(assert) {
    assert.expect(3);

    assert.ok(this.$('.checkbox-selector--metric').is(':visible'), 'The metric selector component is rendered');

    assert.ok(
      this.$('.navi-list-selector').is(':visible'),
      'a navi-list-selector component is rendered as part of the metric selector'
    );

    assert.ok(
      this.$('.grouped-list').is(':visible'),
      'a grouped-list component is rendered as part of the metric selector'
    );
  });

  test('show selected', function(assert) {
    assert.expect(9);

    assert.ok(
      findAll('.grouped-list__item').length > this.get('request.metrics.length'),
      'Initially all the metrics are shown in the metric selector'
    );

    assert.equal(
      find('.navi-list-selector__show-link').textContent.trim(),
      'Show Selected (1)',
      'The Show Selected link has the correct number of selected base metrics shown'
    );

    run(async () => {
      await click('.navi-list-selector__show-link');
    });

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Ad Clicks'],
      'When show selected is clicked only the selected adClicks base metric is shown'
    );

    assert.notOk(
      this.$('.checkbox-selector__checkbox')
        .toArray()
        .map(el => $(el)[0]['checked'])
        .includes(false),
      'The selected items are checked'
    );

    let metrics = get(this, 'request.metrics');
    metrics.removeFragment(metrics.toArray()[0]);

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Ad Clicks'],
      "Removing one metric while another metric with the same base is still selected does not change 'Show Selected'"
    );

    run(async () => {
      await click('.navi-list-selector__show-link');
    });

    assert.equal(
      find('.navi-list-selector__show-link').textContent.trim(),
      'Show Selected (1)',
      'The Show Selected link still has the correct number of selected base metrics shown'
    );

    run(() => {
      metrics.createFragment({
        metric: PageViews,
        parameters: 'Param1'
      });
    });

    assert.equal(
      find('.navi-list-selector__show-link').textContent.trim(),
      'Show Selected (2)',
      'The Show Selected link increases the count when a metric with a different base is added'
    );

    run(async () => {
      await click('.navi-list-selector__show-link');
    });

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Ad Clicks', 'Page Views'],
      'Adding a new metric will show its base metric as selected'
    );

    assert.notOk(
      this.$('.checkbox-selector__checkbox')
        .toArray()
        .map(el => $(el)[0]['checked'])
        .includes(false),
      'All selected items are checked'
    );
  });

  test('add and remove metric actions', function(assert) {
    assert.expect(2);

    this.set('addMetric', metric => {
      assert.equal(metric.get('longName'), 'Total Clicks', 'the clicked metric is passed as a param to the action');
    });

    this.set('removeMetric', metric => {
      assert.equal(metric.get('longName'), 'Ad Clicks', 'the clicked metric is passed as a param to the action');
    });

    //select first time grain
    run(() => {
      //add total clicks
      this.$('.grouped-list__item:contains(Total Clicks) .grouped-list__item-label').click();

      //remove ad clicks
      this.$('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-label').click();
    });
  });

  test('filter icon', function(assert) {
    assert.expect(3);

    assert.notOk(
      isEmpty(this.$('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter--active')),
      'The filter icon with the adclicks metric has the active class'
    );

    assert.ok(
      isEmpty(this.$('.grouped-list__item:contains(Total Clicks) .checkbox-selector__filter--active')),
      'The filter icon with the total clicks metric does not have the active class'
    );

    this.set('addMetricFilter', metric => {
      assert.deepEqual(metric, AdClicks, 'The adclicks metric is passed to the action when filter icon is clicked');
    });

    run(() => {
      this.$('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter').click();
    });
  });

  test('tooltip', function(assert) {
    assert.expect(3);

    assertTooltipNotRendered(assert);
    set(AdClicks, 'extended', {
      content: { description: 'foo' }
    });

    run(() => {
      this.$('.grouped-list__group-header:contains(Clicks)').trigger('click');
      // triggerTooltipTargetEvent will not work for hidden elementc
      this.$('.grouped-list__item:contains(Ad Clicks) .grouped-list__item-info').trigger('mouseenter');
    });

    assertTooltipRendered(assert);
    assertTooltipContent(assert, {
      contentString: 'foo'
    });
  });

  test('metric config for metric with parameters', function(assert) {
    assert.expect(2);

    assert.ok(
      isEmpty(this.$('.grouped-list__item:contains(Ad Clicks) .metric-config')),
      'The metric config trigger icon is not present for a metric without parameters'
    );

    assert.notOk(
      isEmpty(this.$('.grouped-list__item:contains(Revenue) .metric-config')),
      'The metric config trigger icon is present for a metric with parameters'
    );
  });

  test('ranked search', async function(assert) {
    assert.expect(2);

    assert.deepEqual(
      this.$('.grouped-list__item:contains(Page)')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Additive Page Views', 'Page Views', 'Total Page Views', 'Total Page Views WoW'],
      'Initially the page view metrics are ordered alphabetically'
    );

    await fillIn('.navi-list-selector__search-input', 'page');
    await triggerEvent('.navi-list-selector__search-input', 'focusout');

    assert.deepEqual(
      this.$('.grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Page Views', 'Total Page Views', 'Additive Page Views', 'Total Page Views WoW'],
      'The search results are ranked based on relevance'
    );
  });
});
