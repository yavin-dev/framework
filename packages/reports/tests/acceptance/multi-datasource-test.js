import $ from 'jquery';
import { visit, findAll, click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickItem, clickItemFilter, getAllSelected } from 'navi-reports/test-support/report-builder';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import config from 'ember-get-config';

module('Acceptance | multi-datasource report builder', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('multi datasource report', async function(assert) {
    assert.expect(14);

    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await visit('/reports/new');

    await selectChoose('.navi-table-select__trigger', 'Inventory');

    assert.deepEqual(
      findAll('.grouped-list__group-header-content').map(el => el.textContent.trim()),
      ['Personal (4)', 'World (2)', 'Asset (2)', 'Date (1)', 'World (3)', 'Personal (3)'],
      'Metric and dimension categories switched to metrics/dimensions of new datasource'
    );

    await clickItem('dimension', 'Container');
    await clickItem('metric', 'Used Amount');

    await clickItemFilter('dimension', 'Container');
    await selectChoose('.filter-values--dimension-select__trigger', '1');

    await clickItemFilter('metric', 'Used Amount');
    await fillIn('input.filter-values--value-input', '30');

    await clickItem('dimension', 'Date Time');
    await clickItemFilter('dimension', 'Date Time');

    await selectChoose($('.filter-builder__operator-trigger:eq(1)')[0], 'Between');
    await clickTrigger('.filter-values--date-range-input__low-value .ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(4)')[0]);
    await clickTrigger('.filter-values--date-range-input__high-value .ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(5)')[0]);

    await click('.navi-report__run-btn');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject, .filter-builder__subject').map(el => el.textContent.trim()),
      ['Container (id)', 'Date Time (day)', 'Used Amount'],
      'Filter titles rendered correctly'
    );

    assert
      .dom('.filter-values--dimension-select__trigger')
      .containsText('× 1', 'Dimension filter input contains the right value');
    assert.dom('.filter-values--value-input').hasValue('30', 'Having input has the right value');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Filters Container (id) equals 1 Date Time (day) between', 'Collapsed filter contains right text');

    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Used Amount greater than (>) 30', 'Collapsed filter contains right text');
    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map(el => el.textContent.trim()),
      ['Container (id)', 'Used Amount', 'Date Time (day)'],
      'Table displays correct header titles'
    );

    assert.dom('.table-row-vc').exists({ count: 2 }, 'Table has rows');

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Bar Chart y axis label is correct');
    assert.dom('.c3-legend-item').containsText('1', 'Bar chart legend has the right value');

    await click('.report-builder__container-header__filters-toggle');
    await clickTrigger('.filter-values--date-range-input__high-value .ember-basic-dropdown-trigger');
    await click($('button.ember-power-calendar-day--current-month:contains(4)')[0]);
    await click('.navi-report__run-btn');

    await click('.visualization-toggle__option[title="Pie Chart"]');
    assert.dom('.pie-metric-label').hasText('Used Amount', 'Pie chart has the right label');
    assert.dom('.c3-legend-item').containsText('1', 'Pie chart legend has the right value');

    //check api url
    await click('.get-api button');
    assert
      .dom('.get-api-modal-container input')
      .hasValue(/^https:\/\/data2.naviapp.io\/\S+$/, 'shows api url from bardTwo datasource');

    //check CSV export url
    await clickTrigger('.multiple-format-export');
    assert
      .dom(findAll('.multiple-format-export__dropdown a').filter(el => el.textContent.trim() === 'CSV')[0])
      .hasAttribute('href', /^https:\/\/data2.naviapp.io\/\S+$/, 'uses csv export from right datasource');

    config.navi.FEATURES.exportFileTypes = [];
  });

  test('multi datasource saved report', async function(assert) {
    assert.expect(14);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    await visit('/reports/13/view');

    assert.dom('.navi-table-select-item').hasText('Network', 'Table selector shows correct table');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject, .filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (day)'],
      'Filter titles rendered correctly'
    );

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Filters Date Time (day) between', 'Collapsed filter has the right values');

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map(el => el.textContent.trim()),
      ['Date Time (day)', 'Ad Clicks', 'Property (id)'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists('Table rows exist');

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Ad Clicks', 'Bar chart has right Y axis label');
    assert.dom('.c3-legend-item').containsText('114', 'Bar chart legend has right value');

    await click('.visualization-toggle__option[title="Line Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Ad Clicks', 'Line chart has right Y Axis label');
    assert.dom('.c3-legend-item').containsText('114', 'Line chart has right legend value');

    //check api url
    await click('.get-api button');
    assert
      .dom('.get-api-modal-container input')
      .hasValue(
        'https://data.naviapp.io/v1/data/network/day/property/?dateTime=2015-10-02T00%3A00%3A00.000Z%2F2015-10-14T00%3A00%3A00.000Z&metrics=adClicks&format=json',
        'shows api url from bardTwo datasource'
      );

    //check CSV export url
    await clickTrigger('.multiple-format-export');
    assert
      .dom(findAll('.multiple-format-export__dropdown a').filter(el => el.textContent.trim() === 'CSV')[0])
      .hasAttribute(
        'href',
        'https://data.naviapp.io/v1/data/network/day/property/?dateTime=2015-10-02T00%3A00%3A00.000Z%2F2015-10-14T00%3A00%3A00.000Z&metrics=adClicks&format=csv',
        'uses csv export from right datasource'
      );

    await click('.navi-modal__close');

    //switch tables from a different datasource
    await selectChoose('.navi-table-select__trigger', 'Table A');

    //assert filters, metrics and dimensions are reset
    assert
      .dom('.report-builder__container--filters--collapsed')
      .doesNotIncludeText('Date Time (day)', 'Filters do not include dimension filters from external table');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Property'],
      'Only property is selected once table is changed'
    );
    assert.deepEqual(await getAllSelected('metric'), ['Ad Clicks'], 'Only Ad Clicks is selected once table is changed');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });
});
