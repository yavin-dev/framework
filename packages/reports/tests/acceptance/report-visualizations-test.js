import { click, find, findAll, visit, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { selectChoose, selectSearch } from 'ember-power-select/test-support';
import $ from 'jquery';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import config from 'ember-get-config';
import { clickItemFilter, clickItem, clickMetricConfigTrigger } from 'navi-reports/test-support/report-builder';

module('Acceptance | navi-report - report visualizations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('filter changes line chart series', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent.trim()),
      ['Property 1', 'Property 2', 'Property 3'],
      'Without filters, three series are shown in the chart'
    );

    await clickItemFilter(this, 'dimension', 'Property');
    await selectSearch('.filter-values--dimension-select__trigger', 'Property');
    await selectChoose('.filter-values--dimension-select__trigger', '.ember-power-select-option', 0);
    await click('.navi-report__run-btn');

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent.trim()),
      ['Property 1'],
      'With filter, only the filtered series is shown'
    );
  });

  test('Table column sort', async function(assert) {
    assert.expect(38);

    await visit('/reports/2/view');

    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not desc sorted');

    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not asc sorted');

    //sort by first metric desc
    await click('.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Metric is sorted desc on first sort click');

    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not sorted asc on first sort click');

    //sort by first metric asc
    await click('.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--asc', 'Metric is sorted asc on second sort click');

    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not sorted desc on second sort click');

    //remove sort by first metric
    await click('.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not sorted desc after third sort click');

    assert
      .dom('.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not sorted asc after third sort click');

    assert
      .dom('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Datetime is sorted desc by default');

    //sort by dateTime desc
    await click('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--asc', 'Datetime is sorted asc after first sort click');

    //sort by dateTime asc
    await click('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Datetime is sorted desc after second sort click');

    //remove sort by dateTime
    await click('.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');

    //add a parameterized metric with a couple of parameters and run the report
    await clickItem(this, 'metric', 'Platform Revenue');
    const closeConfig = await clickMetricConfigTrigger(this, 'Platform Revenue');
    await clickItem(this, 'metricConfig', 'EUR');
    await closeConfig();
    await click('.navi-report__run-btn');

    //first parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--desc', 'Metric with first parameter is not sorted desc');

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with first parameter is not sorted asc');

    //second parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--desc', 'Metric with second parameter is not sorted desc');

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with second parameter is not sorted asc');

    //sort by first parameter desc
    await click(
      $('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0]
    );
    //first parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasClass('navi-table-sort-icon--desc', 'Metric with first parameter is sorted desc after first sort click');

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with first parameter is not sorted asc after first sort click');

    //second parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--desc',
        'Metric with second parameter is not sorted desc after first sort click'
      );

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with second parameter is not sorted asc after first sort click');

    //test API query and close the modal
    await click('.navi-report__copy-api-btn .get-api__btn');
    assert.ok(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Cdesc'),
      'API query contains sorting by metric with first parameter desc after first sort click'
    );

    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after first sort click'
    );
    await click('.navi-modal__close');

    //sort by first parameter asc
    await click(
      $('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0]
    );
    //first parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--desc',
        'Metric with first parameter is not sorted desc after second sort click'
      );

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasClass('navi-table-sort-icon--asc', 'Metric with first parameter is sorted asc after second sort click');

    //second parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--desc',
        'Metric with second parameter is not sorted desc after second sort click'
      );

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--asc',
        'Metric with second parameter is not sorted asc after second sort click'
      );

    //test API query and close the modal
    await click('.navi-report__copy-api-btn .get-api__btn');
    assert.ok(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Casc'),
      'API query contains sorting by metric with first parameter asc after second sort click'
    );

    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after second sort click'
    );
    await click('.navi-modal__close');

    //remove sort by first parameter
    await click(
      $('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0]
    );
    //first parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--desc',
        'Metric with first parameter is not sorted desc after third sort click'
      );

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with first parameter is not sorted asc after third sort click');

    //second parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass(
        'navi-table-sort-icon--desc',
        'Metric with second parameter is not sorted desc after third sort click'
      );

    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasNoClass('navi-table-sort-icon--asc', 'Metric with second parameter is not sorted asc after third sort click');

    //test API query and close the modal
    await click('.navi-report__copy-api-btn .get-api__btn');
    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after third sort click'
    );

    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after third sort click'
    );
    await click('.navi-modal__close');

    //sort by both parameters
    await click(
      $('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0]
    );
    await click(
      $('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0]
    );
    //first parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (USD)) .navi-table-sort-icon')[0])
      .hasClass(
        'navi-table-sort-icon--desc',
        'Metric with first parameter is sorted desc after sorting by both parameters'
      );

    //second parameter
    assert
      .dom($('.table-header-row .table-header-cell.metric:contains(Platform Revenue (EUR)) .navi-table-sort-icon')[0])
      .hasClass(
        'navi-table-sort-icon--desc',
        'Metric with first parameter is sorted desc after sorting by both parameters'
      );

    //remove the metric
    await clickItem(this, 'metric', 'Platform Revenue');

    //test API query and close the modal
    await click('.navi-report__copy-api-btn .get-api__btn');
    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after removing the metric'
    );

    assert.notOk(
      find('.navi-modal__input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after removing the metric'
    );
    await click('.navi-modal__close');

    //verify that the table visualization is still shown and not an error
    await click('.navi-report__run-btn');
    assert.dom('.table-widget').isVisible('table visualization is still shown');
  });

  test('Table Column Config - Does not prompt for rerun', async function(assert) {
    assert.expect(1);

    await visit('/reports/2');

    //Update column name
    await click('.report-view__visualization-edit-btn');
    await fillIn('.dateTime > .table-header-cell__input', 'test');
    await click('.report-view__visualization-edit-btn');

    assert
      .dom('.report-view__info-text')
      .isNotVisible('Updating the column config does not prompt the user to rerun the report');
  });

  test('Navi Request Preview and Visualization Selector', async function(assert) {
    assert.expect(10);

    const originalFeatureFlag = !!config.navi.FEATURES.enableRequestPreview;
    config.navi.FEATURES.enableRequestPreview = true;

    await visit('reports/1/view');

    assert.deepEqual(
      findAll('.visualization-selector__option').map(el => el.title),
      ['Request Preview', 'Bar Chart', 'Line Chart', 'Data Table'],
      'All valid visualizations and the request preview are present in the vis selector'
    );
    assert
      .dom('.visualization-selector__option--is-active')
      .hasAttribute('title', 'Line Chart', 'The visualization type from the report is selected');
    assert.dom('.line-chart-widget').isVisible('The selected visualization matches the visualization being rendered');

    await click('.visualization-selector__option[title="Request Preview"]');

    assert
      .dom('.navi-request-preview')
      .isVisible('The request preview is now displayed after clicking the icon in the vis selector');

    assert.deepEqual(
      findAll('.navi-request-preview__column-header').map(el => el.textContent.trim()),
      ['Date', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Request columns are shown in request preview'
    );

    // Add Revenue (USD) metric
    await click($('.grouped-list__group-header-content:contains(Revenue)')[0]);
    await click($('.grouped-list__item-label:contains(Revenue) .grouped-list__add-icon')[1]);

    // Edit Revenue metric
    await click(
      $(
        '.navi-request-preview__column-header:contains(Revenue) .navi-request-preview__column-header-options-trigger'
      )[0]
    );
    await click($('.navi-request-preview__column-header-option:contains(Edit)')[0]);

    assert.dom('.navi-request-column-config').isVisible('Column config opens on edit');

    // Set Revenue parameter to Canadian Dollars
    await selectChoose('#columnParameter', 'Dollars (CAD)');

    // Remove Ad Clicks Metric
    await click(
      $(
        '.navi-request-preview__column-header:contains(Ad Clicks) .navi-request-preview__column-header-options-trigger'
      )[0]
    );
    await click($('.navi-request-preview__column-header-option:contains(Remove)')[0]);

    await click('.navi-report__run-btn');

    assert
      .dom('.line-chart-widget')
      .isVisible(
        'Running the report from the request preview will change the visualization back to the most recently chosen visualization'
      );

    await click('.visualization-selector__option[title="Data Table"]');

    assert.deepEqual(
      findAll('.table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Property', 'Nav Link Clicks', 'Revenue (CAD)'],
      'Changes made in the request preview are reflected in other visualizations'
    );

    await click('.visualization-selector__option[title="Request Preview"]');

    // Remove Nav Link Clicks Metric
    await click(
      $(
        '.navi-request-preview__column-header:contains(Nav Link Clicks) .navi-request-preview__column-header-options-trigger'
      )[0]
    );
    await click($('.navi-request-preview__column-header-option:contains(Remove)')[0]);

    // Save the report
    await click('.navi-report__save-btn');

    assert
      .dom('.table-widget')
      .isVisible(
        'Saving the report from the request preview will change the visualization to the most recently selected visualization'
      );
    assert.deepEqual(
      findAll('.table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Property', 'Revenue (CAD)'],
      'Changes made in the request preview are reflected in the table after report save'
    );

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });

  test('Navi Request Preview on new report', async function(assert) {
    assert.expect(13);

    const originalFeatureFlag = !!config.navi.FEATURES.enableRequestPreview;
    config.navi.FEATURES.enableRequestPreview = true;

    await visit('/reports/new');

    // Add Revenue (USD) metric
    await clickItem(this, 'metric', 'Revenue');

    // Add Browser Dimension
    await clickItem(this, 'dimension', 'Browser');

    // Run Report
    await click('.navi-report__run-btn');

    assert.dom('.table-widget').isVisible('Table rendered on initial run');
    assert
      .dom('.visualization-selector__option--is-active')
      .hasAttribute('title', 'Data Table', 'The visualization type from the report is selected');

    assert.deepEqual(
      findAll('.table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Browser', 'Revenue (USD)'],
      'Selected columns are shown in the data table'
    );

    //Open Table Edit options
    await click('.report-view__visualization-edit-btn');
    assert.dom('.report-view__visualization-edit').isVisible('Table edit pane is open');

    // Select Request Preview
    await click('.visualization-selector__option[title="Request Preview"]');

    assert
      .dom('.report-view__visualization-edit')
      .isNotVisible('Visualization edit pane closes when request preview is selected');
    assert.deepEqual(
      findAll('.navi-request-preview__column-header').map(el => el.textContent.trim()),
      ['Date', 'Browser', 'Revenue (USD)'],
      'Request columns are shown in request preview'
    );
    assert
      .dom('.visualization-selector__option--is-active')
      .hasAttribute('title', 'Request Preview', 'The visualization type from the report is selected');

    // Edit Revenue metric
    await click(
      $(
        '.navi-request-preview__column-header:contains(Revenue) .navi-request-preview__column-header-options-trigger'
      )[0]
    );
    await click($('.navi-request-preview__column-header-option:contains(Edit)')[0]);

    assert.dom('.navi-request-column-config').isVisible('Column config opens on edit');

    // Set Revenue parameter to Canadian Dollars
    await selectChoose('#columnParameter', 'Euro (EUR)');

    assert.deepEqual(
      findAll('.navi-request-preview__column-header').map(el => el.textContent.trim()),
      ['Date', 'Browser', 'Revenue (EUR)'],
      'Revenue metric updates'
    );

    assert
      .dom('.report-view__info-text')
      .hasText(
        'Run request to update Table',
        'Changes to the request are detected and user is notified that a rerun is needed to update most recently selected visualization'
      );

    // Run Report
    await click('.navi-report__run-btn');
    assert.dom('.table-widget').isVisible('Previously selected visualization rendered on run');
    assert
      .dom('.visualization-selector__option--is-active')
      .hasAttribute('title', 'Data Table', 'The visualization type from the report is selected');

    assert.deepEqual(
      findAll('.table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Browser', 'Revenue (EUR)'],
      'Changes made in the request preview are reflected in the other visualizations'
    );

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });
});
