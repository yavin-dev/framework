import { click, find, findAll, visit, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { selectChoose, selectSearch } from 'ember-power-select/test-support';
import $ from 'jquery';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickItemFilter, clickItem } from 'navi-reports/test-support/report-builder';

module('Acceptance | navi-report - report visualizations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('filter changes line chart series', async function (assert) {
    assert.expect(2);

    await visit('/reports/1/view');

    assert.deepEqual(
      findAll('.c3-legend-item').map((el) => el.textContent.trim()),
      ['Property 1', 'Property 2', 'Property 3', 'Property 4'],
      'Without filters, four series are shown in the chart'
    );

    await clickItemFilter('dimension', 'Property');
    await selectSearch('.filter-values--dimension-select__trigger', 'Property');
    await selectChoose('.filter-values--dimension-select__trigger', '.ember-power-select-option', 0);
    await click('.navi-report__run-btn');

    assert.deepEqual(
      findAll('.c3-legend-item').map((el) => el.textContent.trim()),
      ['Property 1'],
      'With filter, only the filtered series is shown'
    );
  });

  test('Table column sort', async function (assert) {
    assert.expect(37);

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

    //sort by timeDimension desc
    await click('.table-header-row .table-header-cell.timeDimension .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.timeDimension .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'timeDimension is sorted desc after first sort click');

    //sort by timeDimension asc
    await click('.table-header-row .table-header-cell.timeDimension .navi-table-sort-icon');
    assert
      .dom('.table-header-row .table-header-cell.timeDimension .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--asc', 'timeDimension is sorted asc after second sort click');

    //add a parameterized metric with a couple of parameters and run the report
    await clickItem('metric', 'Platform Revenue');
    await selectChoose('.navi-column-config-item__parameter', 'Euro');
    await clickItem('metric', 'Platform Revenue');
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
    await click('.get-api__action-btn');
    assert.ok(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Cdesc'),
      'API query contains sorting by metric with first parameter desc after first sort click'
    );

    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after first sort click'
    );
    await click('.d-close');

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
    await click('.get-api__action-btn');
    assert.ok(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)%7Casc'),
      'API query contains sorting by metric with first parameter asc after second sort click'
    );

    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after second sort click'
    );
    await click('.d-close');

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
    await click('.get-api__action-btn');
    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after third sort click'
    );

    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after third sort click'
    );
    await click('.d-close');

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

    //remove both the EUR metric and the USD metric
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Platform Revenue (EUR)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Platform Revenue (USD)"]');

    //test API query and close the modal
    await click('.get-api__action-btn');
    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DUSD)'),
      'API query does not contain sorting by metric with first parameter after removing the metric'
    );

    assert.notOk(
      find('.get-api__api-input').value.includes('sort=dateTime%7Casc%2CplatformRevenue(currency%3DEUR)'),
      'API query does not contain sorting by metric with second parameter after removing the metric'
    );
    await click('.d-close');

    //verify that the table visualization is still shown and not an error
    await click('.navi-report__run-btn');
    assert.dom('.table-widget').isVisible('table visualization is still shown');
  });

  test('Table Column Config - Does not prompt for rerun', async function (assert) {
    assert.expect(1);

    await visit('/reports/2');

    //Update column name
    await click('.report-view__visualization-edit-btn');
    await fillIn('.table-header-cell__input', 'test');
    await click('.report-view__visualization-edit-btn');

    assert
      .dom('.report-view__info-text')
      .isNotVisible('Updating the column config does not prompt the user to rerun the report');
  });
});
