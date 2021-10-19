import $ from 'jquery';
import { visit, findAll, click, fillIn, find, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickItem, clickItemFilter } from 'navi-reports/test-support/report-builder';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import config from 'ember-get-config';

module('Acceptance | multi-datasource report builder', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  });

  hooks.afterEach(function () {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('multi datasource report', async function (assert) {
    assert.expect(19);

    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await visit('/reports/new');

    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');
    await animationsSettled();

    assert.deepEqual(
      findAll('.grouped-list__group-header-content').map((el) => el.textContent.trim()),
      ['Personal (4)', 'World (2)', 'Asset (2)', 'Date (1)', 'Personal (3)', 'World (3)'],
      'Metric and dimension categories switched to metrics/dimensions of new datasource'
    );

    await clickItem('dimension', 'Container');
    await clickItem('metric', 'Used Amount');

    await clickItemFilter('dimension', 'Container');
    await selectChoose('.filter-values--dimension-select__trigger', '1');

    await clickItemFilter('metric', 'Used Amount');
    await fillIn('input.filter-values--value-input', '1');

    await clickItem('dimension', 'Date Time');

    await selectChoose($('.filter-builder__operator-trigger:eq(0)')[0], 'Between');
    // First of last month
    await clickTrigger('.filter-values--date-range-input__low-value.ember-basic-dropdown-trigger');
    await click('.ember-power-calendar-nav-control--previous');
    await click($('button.ember-power-calendar-day--current-month:contains(1)')[0]);
    // Second of last month
    await clickTrigger('.filter-values--date-range-input__high-value.ember-basic-dropdown-trigger');
    await click('.ember-power-calendar-nav-control--previous');
    await click($('button.ember-power-calendar-day--current-month:contains(2)')[0]);

    await click('.navi-report__run-btn');

    //Check if filters meta data is displaying properly
    assert.dom(findAll('.filter-builder__subject .name')[0]).hasText('Date Time', 'Date time filter renders correctly');

    assert
      .dom(findAll('.filter-builder__subject .chips')[0])
      .hasText('day', 'Date time filter parameter renders correctly');

    assert.dom(findAll('.filter-builder__subject .name')[1]).hasText('Container', 'Second filter rendered correctly');

    assert
      .dom(findAll('.filter-builder__subject .chips')[1])
      .hasText('id', 'Second filter parameter rendered correctly');

    assert.dom(findAll('.filter-builder__subject .name')[2]).hasText('Used Amount', 'Third filter rendered correctly');

    assert
      .dom('.filter-values--dimension-select__trigger')
      .containsText('× 1', 'Dimension filter input contains the right value');
    assert.dom('.filter-values--value-input').hasValue('1', 'Having input has the right value');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Filters Date Time (day) between', 'Collapsed date filter contains right text');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Container (id) equals 1', 'Collapsed dimension filter contains right text');

    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Used Amount greater than (>) 1', 'Collapsed metric filter contains right text');
    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map((el) => el.textContent.trim()),
      ['Date Time (day)', 'Container (id)', 'Used Amount'],
      'Table displays correct header titles'
    );

    assert.dom('.table-row-vc').exists({ count: 2 }, 'Table has rows');

    await click('.visualization-toggle__option-icon[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Bar Chart y axis label is correct');
    assert.dom('.c3-legend-item').containsText('1', 'Bar chart legend has the right value');

    await click('.report-builder__container-header__filters-toggle');
    await clickTrigger('.filter-values--date-range-input__high-value.ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(1)')[0]);
    await click('.navi-report__run-btn');

    await click('.visualization-toggle__option-icon[title="Pie Chart"]');
    assert.dom('.pie-metric-label').hasText('Used Amount', 'Pie chart has the right label');
    assert.dom('.c3-legend-item').containsText('1', 'Pie chart legend has the right value');

    //check api url
    await click('.get-api__action-btn');
    assert
      .dom('.get-api__modal input')
      .hasValue(/^https:\/\/data2.naviapp.io\/\S+$/, 'shows api url from bardTwo datasource');

    //check CSV export url
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("CSV")')[0]);
    assert.ok(
      find('.export__download-link')?.getAttribute('href').startsWith('https://data2.naviapp.io/'),
      'uses csv export from right datasource'
    );

    config.navi.FEATURES.exportFileTypes = [];
  });

  test('multi datasource saved report', async function (assert) {
    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await visit('/reports/12/view');

    assert.dom('.report-builder-sidebar__source').hasText('Inventory', 'Table selector shows correct table');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject .name').map((el) => el.textContent.trim()),
      ['Date Time', 'Container', 'Used Amount'],
      'Filter titles rendered correctly'
    );

    assert.deepEqual(
      findAll('.filter-builder__subject .chips').map((el) => el.textContent.trim()),
      ['day', 'id'],
      'Filter parameters rendered correctly'
    );

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Container (id) equals 2 Used Amount greater than (>) 50', 'Collapsed filter has the right values');

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map((el) => el.textContent.trim()),
      ['Date Time (day)', 'Container (desc)', 'Display Currency (desc)', 'Used Amount', 'Revenue (GIL)'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists('Table rows exist');

    await click('.visualization-toggle__option-icon[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Bar chart has right Y axis label');
    assert.dom('.c3-legend-item').containsText('Bank,UNKNOWN', 'Bar chart legend has right value');

    await click('.visualization-toggle__option-icon[title="Line Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Line chart has right Y Axis label');
    assert.dom('.c3-legend-item').containsText('Bank,UNKNOWN', 'Line chart has right legend value');

    //check api url
    await click('.get-api__action-btn');
    assert
      .dom('.get-api__modal input')
      .hasValue(
        'https://data2.naviapp.io/v1/data/inventory/day/container;show=desc/displayCurrency;show=desc/?dateTime=P3D%2Fcurrent&metrics=usedAmount%2Crevenue(currency%3DGIL)&filters=container%7Cid-in%5B%222%22%5D&having=usedAmount-gt%5B50%5D&format=json',
        'shows api url from bardTwo datasource'
      );

    //check CSV export url
    await triggerEvent('.menu-trigger', 'mouseenter');
    await click($('.menu-content a:contains("CSV")')[0]);
    assert
      .dom('.export__download-link')
      .hasAttribute(
        'href',
        'https://data2.naviapp.io/v1/data/inventory/day/container;show=desc/displayCurrency;show=desc/?dateTime=P3D%2Fcurrent&metrics=usedAmount%2Crevenue(currency%3DGIL)&filters=container%7Cid-in%5B%222%22%5D&having=usedAmount-gt%5B50%5D&format=csv',
        'uses csv export from right datasource'
      );

    await click('.d-close');

    //switch tables from a different datasource
    await click('.report-builder-sidebar__breadcrumb-item[data-level="0"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Table A"]');
    await animationsSettled();

    //assert filters, metrics and dimensions are reset
    assert
      .dom('.filter-builder__subject')
      .includesText('Date Time day', 'The request is constrained and adds back the required filters');
    assert.dom('.report-builder__container--filters--collapsed').doesNotExist('The filters are reopened');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });
});
