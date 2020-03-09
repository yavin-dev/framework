import { visit, findAll, click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { clickItem, clickItemFilter } from 'navi-reports/test-support/report-builder';
import { selectChoose } from 'ember-power-select/test-support';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
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
      ['Time Grain (6)', 'Personal (3)', 'World (2)', 'Asset (2)', 'Personal (3)', 'World (2)'],
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

    assert.dom('.filter-builder-dimension__values').containsText('Bag');
    assert.dom('.filter-values--value-input').hasValue('30');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Container equals Bag (1) Used Amount greater than (>) 30');

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title ').map(el => el.textContent.trim()),
      ['Date', 'Container', 'Used Amount'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists({ count: 1 });

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount');
    assert.dom('.c3-legend-item').containsText('Bag');

    await click('.visualization-toggle__option[title="Pie Chart"]');
    assert.dom('.pie-metric-label').hasText('Used Amount');
    assert.dom('.c3-legend-item').containsText('Bag');

    //check api url
    await click('.get-api button');
    assert
      .dom('.get-api-modal-container input')
      .hasValue(/^https:\/\/data2.naviapp.io\/\S+$/, 'shows api url from blockhead datasource');

    //check CSV export url
    await clickTrigger('.multiple-format-export');
    assert
      .dom(findAll('.multiple-format-export__dropdown a').filter(el => el.textContent.trim() === 'CSV')[0])
      .hasAttribute('href', /^https:\/\/data2.naviapp.io\/\S+$/, 'uses csv export from right datasource');
  });

  test('multi datasource saved report', async function(assert) {
    assert.expect(13);

    await visit('/reports/12/view');

    assert.dom('.navi-table-select-item').hasText('Inventory');

    //Check if filters meta data is displaying properly
    assert.deepEqual(
      findAll('.filter-builder__subject, .filter-builder-dimension__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Container', 'Used Amount'],
      'Filter titles rendered correctly'
    );

    assert.dom('.filter-builder-dimension__values').containsText('Bank');
    assert.dom('.filter-values--value-input').hasValue('50');

    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.report-builder__container--filters--collapsed')
      .containsText('Container equals Bank (2) Used Amount greater than (>) 50');

    //check visualizations are showing up correctly
    assert.deepEqual(
      findAll('.table-widget__table-headers .table-header-cell__title ').map(el => el.textContent.trim()),
      ['Date', 'Container', 'Used Amount'],
      'Table displays correct header titles'
    );
    assert.dom('.table-widget__table .table-row-vc').exists({ count: 3 });

    await click('.visualization-toggle__option[title="Bar Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount');
    assert.dom('.c3-legend-item').containsText('Bank');

    await click('.visualization-toggle__option[title="Line Chart"]');
    assert.dom('.c3-axis-y-label').hasText('Used Amount');
    assert.dom('.c3-legend-item').containsText('Bank');

    //check api url
    await click('.get-api button');
    assert
      .dom('.get-api-modal-container input')
      .hasValue(/^https:\/\/data2.naviapp.io\/\S+$/, 'shows api url from blockhead datasource');

    //check CSV export url
    await clickTrigger('.multiple-format-export');
    assert
      .dom(findAll('.multiple-format-export__dropdown a').filter(el => el.textContent.trim() === 'CSV')[0])
      .hasAttribute('href', /^https:\/\/data2.naviapp.io\/\S+$/, 'uses csv export from right datasource');
  });
});
