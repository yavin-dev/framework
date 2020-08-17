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
    assert.expect(13);

    await visit('/reports/new');

    await selectChoose('.navi-table-select__dropdown', 'Inventory');

    assert.deepEqual(
      findAll('.grouped-list__group-header-content').map(el => el.textContent.trim()),
      ['Date (1)', 'Personal (4)', 'World (2)', 'Asset (2)', 'World (3)', 'Personal (3)'],
      'Metric and dimension categories switched to metrics/dimensions of new datasource'
    );

    await clickItem('dimension', 'Container');
    await clickItem('metric', 'Used Amount');

    await clickItemFilter('dimension', 'Container');
    await selectChoose('.filter-values--dimension-select__trigger', 'Bag');

    await clickItemFilter('metric', 'Used Amount');
    await fillIn('input.filter-values--value-input', '30');
    await click('.navi-report__run-btn');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject, .filter-builder-dimension__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Container', 'Used Amount'],
      'Filter titles rendered correctly'
    );

    assert
      .dom('.filter-builder-dimension__values')
      .containsText('Bag', 'Dimension filter input contains the right value');
    assert.dom('.filter-values--value-input').hasValue('30', 'Having input has the right value');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Container equals Bag (1) Used Amount greater than (>) 30', 'Collapsed filter contains right text');

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Container', 'Used Amount'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists({ count: 1 }, 'Table has rows');

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Bar Chart y axis label is correct');
    assert.dom('.c3-legend-item').containsText('Bag', 'Bar chart legend has the right value');

    await click('.visualization-toggle__option[title="Pie Chart"]');
    assert.dom('.pie-metric-label').hasText('Used Amount', 'Pie chart has the right label');
    assert.dom('.c3-legend-item').containsText('Bag', 'Pie chart legend has the right value');

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
  });

  test('multi datasource saved report', async function(assert) {
    assert.expect(18);

    await visit('/reports/12/view');

    assert.dom('.navi-table-select-item').hasText('Inventory', 'Table selector shows correct table');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject, .filter-builder-dimension__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Container', 'Used Amount'],
      'Filter titles rendered correctly'
    );

    assert.dom('.filter-builder-dimension__values').containsText('Bank', 'Dimension filter input has the right value');
    assert.dom('.filter-values--value-input').hasValue('50', 'Having input has the right value');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText(
        'Container equals Bank (2) Used Amount greater than (>) 50',
        'Collapsed filter has the right values'
      );

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title').map(el => el.textContent.trim()),
      ['Date', 'Container', 'Display Currency', 'Used Amount', 'Revenue (GIL)'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists('Table rows exist');

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Bar chart has right Y axis label');
    assert.dom('.c3-legend-item').containsText('Bank', 'Bar chart legend has right value');

    await click('.visualization-toggle__option[title="Line Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount', 'Line chart has right Y Axis label');
    assert.dom('.c3-legend-item').containsText('Bank', 'Line chart has right legend value');

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

    await click('.navi-modal__close');

    //switch tables from a different datasource
    await selectChoose('.navi-table-select__dropdown', 'Network');

    //assert filters, metrics and dimensions are reset
    assert
      .dom('.report-builder__container--filters--collapsed')
      .hasText(/[A-Za-z]{3} \d{1,2}, \d{4} - [A-Za-z]{3} \d{1,2}, \d{4}/m, 'Collapsed filter has the right values');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .doesNotIncludeText('Container', 'Filters do not include dimension filters from external table');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .doesNotIncludeText('Used Amount', 'Havings do not include metric havings from external table');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Date Time'],
      'Only timegrain is selected once table is changed'
    );
    assert.deepEqual(await getAllSelected('metric'), [], 'No metrics are selected once table is changed');
  });
});
