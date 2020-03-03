import { click, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import $ from 'jquery';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  clickItem,
  clickItemFilter,
  hasMetricConfig,
  clickMetricConfigTrigger,
  getItem,
  getAllSelected
} from 'navi-reports/test-support/report-builder';

module('Acceptance | navi-report - metric parameters', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('adding and removing metrics', async function(assert) {
    assert.expect(6);

    await visit('/reports/1/view');

    assert.ok(
      await hasMetricConfig('Platform Revenue'),
      'Revenue metric has the metric config icon since it has parameters'
    );

    //adding a metric with default params
    await clickItem('metric', 'Platform Revenue');
    await clickMetricConfigTrigger('Platform Revenue');

    assert
      .dom('.metric-config__dropdown-container .navi-list-selector__show-link')
      .hasText(
        'Show Selected (1)',
        'The Show Selected link has the correct number of selected metric parameters shown'
      );

    assert.deepEqual(
      await getAllSelected('metricConfig'),
      ['Dollars (USD)'],
      'When show selected is clicked only the default parameter for the metric is shown'
    );

    //adding another param for the same metric
    await clickItem('metricConfig', 'EUR');

    assert.deepEqual(
      await getAllSelected('metricConfig'),
      ['Dollars (USD)', 'Euro (EUR)'],
      'When show selected is clicked all the selected parameters for the metric are shown'
    );

    //closing and reopening dropdown does not affect the selected params
    await click('.metric-config__dropdown-container .metric-config__done-btn');
    // await closeConfig();
    await clickMetricConfigTrigger('Platform Revenue');

    assert.deepEqual(
      await getAllSelected('metricConfig'),
      ['Dollars (USD)', 'Euro (EUR)'],
      'When show selected is clicked all the selected parameters for the metric are shown'
    );

    //close the metric config
    await click('.metric-config__done-btn');

    //removing the metric
    await clickItem('metric', 'Platform Revenue');
    await clickMetricConfigTrigger('Platform Revenue');

    assert
      .dom('.metric-config__dropdown-container .navi-list-selector__show-link')
      .hasText('Show Selected (0)', 'removing the metric removes all selected params');
  });

  test('auto open metric config', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    //add revenue (metric with params)
    const { item, reset } = await getItem('metric', 'Platform Revenue');
    await click(item.querySelector('.grouped-list__item-label')); // add but don't reset state
    assert
      .dom('.metric-config__dropdown-container')
      .isVisible('The metric config dropdown container is opened when a metric with parameters is selected');

    //close the config dropdown
    await click('.metric-config__dropdown-container .metric-config__done-btn');
    assert
      .dom('.metric-config__dropdown-container')
      .isNotVisible('The metric config dropdown container is closed when the done button is clicked');

    await reset();

    //remove revenue
    await clickItem('metric', 'Platform Revenue');
    assert
      .dom('.metric-config__dropdown-container')
      .isNotVisible('The metric config dropdown container remains closed when the metric is removed');
  });

  test('metric config - filter parameter', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    const close = await clickMetricConfigTrigger('Platform Revenue');
    await clickItemFilter('metricConfig', 'EUR');

    assert.deepEqual(
      await getAllSelected('metricConfig'),
      ['Dollars (USD)', 'Euro (EUR)'],
      'The filtered parameter is also selected'
    );

    assert.ok(!!$('.filter-builder__subject:contains(EUR)'), 'The parameterized metric is added as a filter');
    await close();
  });

  test('metric filter config', async function(assert) {
    assert.expect(4);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    const closeConfig = await clickMetricConfigTrigger('Platform Revenue');
    await clickItem('metricConfig', 'AUD');
    await clickItem('metricConfig', 'CAD');
    await clickItemFilter('metricConfig', 'EUR');
    await click('.metric-config__dropdown-container .navi-list-selector__show-link');

    assert.ok(
      !!$('.filter-builder__subject:contains(EUR) .metric-filter-config__trigger-icon').length,
      'The metric config trigger icon is rendered next to the parameterized filter'
    );

    await click($('.filter-builder__subject:contains(EUR) .metric-filter-config__trigger-icon')[0]);
    assert.deepEqual(
      findAll('.metric-filter-config__item').map(el => el.innerText.trim()),
      ['USD', 'AUD', 'CAD'],
      'Only the non filtered parameters from the list of selected metrics are shown in the filter config list'
    );

    await click($('.metric-filter-config__item:contains(USD)')[0]);
    assert
      .dom($('.filter-builder__subject:contains(Platform Revenue)')[0])
      .hasText('Platform Revenue (USD)', 'The Euro parameter is updated to USD');

    await click($('.filter-builder__subject:contains(USD) .metric-filter-config__trigger-icon')[0]);
    assert.deepEqual(
      findAll('.metric-filter-config__item').map(el => el.innerText.trim()),
      ['AUD', 'CAD', 'EUR'],
      'the parameter list in the metric filter config is updated to hold the unfiltered parameters'
    );

    await closeConfig();
  });

  test('metric selector filter action for parameterized metrics', async function(assert) {
    assert.expect(10);

    await visit('/reports/1/view');
    await clickItem('metric', 'Platform Revenue');
    const closeConfig = await clickMetricConfigTrigger('Platform Revenue');
    await clickItem('metricConfig', 'AUD');
    await click('.metric-config__dropdown-container .metric-config__done-btn');

    //collapse filters
    await closeConfig();
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (1)');

    await clickItemFilter('metric', 'Platform Revenue');
    assert.equal(
      findAll('.filter-builder__subject').filter(el => el.innerText.includes('Revenue')).length,
      1,
      'The metric filter adds a single filter of type revenue'
    );
    assert
      .dom('.filter-collection')
      .doesNotHaveClass(
        'filter-collection--collapsed',
        'Adding a parameterized metric filter expands the filters section'
      );

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (2)');

    await clickItemFilter('metric', 'Platform Revenue');
    assert.equal(
      findAll('.filter-builder__subject').filter(el => el.innerText.includes('Platform Revenue')).length,
      2,
      'Clicking on the filter adds another filter of type revenue'
    );

    assert
      .dom('.filter-collection')
      .doesNotHaveClass(
        'filter-collection--collapsed',
        'Adding a parameterized metric filter with a different parameter expands the filters section'
      );

    assert.deepEqual(
      findAll('.filter-builder__subject')
        .filter(el => el.innerText.includes('Platform Revenue'))
        .map(el => el.innerText.trim()),
      ['Platform Revenue (AUD)', 'Platform Revenue (USD)'],
      'Both the selected metrics have been added as filters'
    );

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (3)');

    await clickItemFilter('metric', 'Platform Revenue');
    assert.equal(
      findAll('.filter-builder__subject').filter(el => el.innerText.includes('Platform Revenue')).length,
      0,
      'After adding all the request parameters for a metric, clicking an additional time removes all filters for the metric'
    );
    assert
      .dom('.filter-collection')
      .hasClass(
        'filter-collection--collapsed',
        'Filters are still collapsed when removing a parameterized metric filter'
      );
  });

  test('old reports still allow you to choose parameters', async function(assert) {
    assert.expect(1);
    await visit('/reports/11/view');

    await click('.report-builder__metric-selector .navi-list-selector__show-link');
    await clickMetricConfigTrigger('Revenue');

    const options = findAll('.metric-config__dropdown-container .grouped-list__item');
    assert.ok(options.length > 0, 'Metric options should render');
  });
});
