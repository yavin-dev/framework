import { click, find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import { findContains } from '../helpers/contains-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | navi-report - report visualizations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('filter changes line chart series', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent.trim()),
      ['Property 1', 'Property 2', 'Property 3'],
      'Without filters, three series are shown in the chart'
    );

    await click(
      findContains(
        '.grouped-list__group:contains(Asset) .checkbox-selector--dimension .grouped-list__item:contains(Property) .checkbox-selector__filter'
      )
    );
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
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not desc sorted');

    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not asc sorted');

    //sort by first metric desc
    await click('div.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Metric is sorted desc on first sort click');

    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not sorted asc on first sort click');

    //sort by first metric asc
    await click('div.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--asc', 'Metric is sorted asc on second sort click');

    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not sorted desc on second sort click');

    //remove sort by first metric
    await click('div.table-header-row .table-header-cell.metric .navi-table-sort-icon');
    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--desc', 'Metric is not sorted desc after third sort click');

    assert
      .dom('div.table-header-row .table-header-cell.metric .navi-table-sort-icon')
      .doesNotHaveClass('navi-table-sort-icon--asc', 'Metric is not sorted asc after third sort click');

    assert
      .dom('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Datetime is sorted desc by default');

    //sort by dateTime desc
    await click('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');
    assert
      .dom('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--asc', 'Datetime is sorted asc after first sort click');

    //sort by dateTime asc
    await click('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');
    assert
      .dom('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon')
      .hasClass('navi-table-sort-icon--desc', 'Datetime is sorted desc after second sort click');

    //remove sort by dateTime
    await click('div.table-header-row .table-header-cell.dateTime .navi-table-sort-icon');

    //add a parameterized metric with a couple of parameters and run the report
    await click(
      findContains(
        '.report-builder__metric-selector .grouped-list__item:contains(Platform Revenue) .grouped-list__item-label'
      )
    );
    await click(
      findContains('.metric-config__dropdown-container .grouped-list__item:contains(Euro) .grouped-list__item-label')
    );
    await click('.navi-report__run-btn');

    //first parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is not sorted desc'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with first parameter is not sorted asc'
    );

    //second parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with second parameter is not sorted desc'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with second parameter is not sorted asc'
    );

    //sort by first parameter desc
    await click(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      )
    );
    //first parameter
    assert.ok(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is sorted desc after first sort click'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with first parameter is not sorted asc after first sort click'
    );

    //second parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with second parameter is not sorted desc after first sort click'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with second parameter is not sorted asc after first sort click'
    );

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
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      )
    );
    //first parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is not sorted desc after second sort click'
    );

    assert.ok(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with first parameter is sorted asc after second sort click'
    );

    //second parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with second parameter is not sorted desc after second sort click'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
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
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      )
    );
    //first parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is not sorted desc after third sort click'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with first parameter is not sorted asc after third sort click'
    );

    //second parameter
    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with second parameter is not sorted desc after third sort click'
    );

    assert.notOk(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--asc'),
      'Metric with second parameter is not sorted asc after third sort click'
    );

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
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      )
    );
    await click(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      )
    );
    //first parameter
    assert.ok(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (USD)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is sorted desc after sorting by both parameters'
    );

    //second parameter
    assert.ok(
      findContains(
        'div.table-header-row .table-header-cell.metric:contains("Platform Revenue (EUR)") .navi-table-sort-icon'
      ).classList.contains('navi-table-sort-icon--desc'),
      'Metric with first parameter is sorted desc after sorting by both parameters'
    );

    //remove the metric
    await click(
      findContains(
        '.report-builder__metric-selector .grouped-list__item:contains(Platform Revenue) .grouped-list__item-label'
      )
    );

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
});

test('Table Column Config - Does not prompt for rerun', function(assert) {
  visit('/reports/2/view');

  //Update column name
  click('.report-view__visualization-edit-btn');
  fillIn('.dateTime > .table-header-cell__input', 'test');
  click('.report-view__visualization-edit-btn');

  andThen(() => {
    assert.notOk(
      !!find('.report-view__info-text').length,
      'Updating the column config does not prompt the user to rerun the report'
    );
  });
});
