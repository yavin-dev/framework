import { module, test } from 'qunit';
import { visit, click, findAll, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';

module('Acceptance | Multi datasource Dashboard', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('Load multi-datasource dashboard', async function (assert) {
    assert.expect(10);
    await visit('/dashboards/6/view');

    assert.dom('.navi-widget__header').exists({ count: 3 }, 'Three widgets loaded');
    assert.dom('.c3-chart-component').exists({ count: 3 }, 'Three visualizations loaded');

    assert.dom('.navi-widget__filter-errors-icon').exists({ count: 3 }, 'Filter warning is shown on each widget');

    assert
      .dom('.filter-collection--collapsed')
      .hasText('Age (id) equals 1 2 3 Container (id) not equals 1', 'Collapsed filter has the right text');

    await click('.dashboard-filters__toggle');

    assert
      .dom(findAll('.filter-builder__subject .name')[0])
      .hasText('Age', 'Dimension 1 is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .chips')[0])
      .hasText('id', 'Dimension 1 parameter is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .name')[1])
      .hasText('Container', 'Dimension 2 is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .chips')[1])
      .hasText('id', 'Dimension 2 parameter is properly labeled in filters');

    assert.deepEqual(
      findAll('.filter-builder__operator-trigger').map((el) => el.textContent.trim()),
      ['Equals', 'Not Equals'],
      'Dimension filter operators are shown correctly'
    );

    assert.deepEqual(
      findAll('.filter-values--dimension-select__trigger').map((el) =>
        [
          ...el.querySelectorAll('.ember-power-select-multiple-option :not(.ember-power-select-multiple-remove-btn)'),
        ].map((el) => el.textContent.trim())
      ),
      [['1', '2', '3'], ['1']],
      'Dimension value selector showing the right values'
    );
  });

  test('Create new multisource dashboard', async function (assert) {
    assert.expect(8);

    await visit('/dashboards/new');
    await click('.dashboard-header__add-widget-btn');
    await selectChoose('.add-widget__report-select-trigger', 'Report 12');
    await click('.add-widget__add-btn');

    assert.dom('.navi-widget__header').exists({ count: 1 }, 'One widget loaded');
    assert.dom('.c3-chart-component').exists({ count: 1 }, 'One visualization loaded');

    await click('.dashboard-header__add-widget-btn');
    await click('.add-widget__new-btn');

    await click('.report-builder-source-selector__source-button[data-source-name="Bard Two"]');
    await click('.report-builder-source-selector__source-button[data-source-name="Inventory"]');
    await animationsSettled();
    await clickItem('dimension', 'Date Time');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Day');
    await selectChoose('.filter-builder__operator-trigger', 'Current');
    await clickItem('dimension', 'Container');
    await clickItem('metric', 'Used Amount');

    await click('.navi-report-widget__run-btn');
    await click('.navi-report-widget__save-btn');

    assert.dom('.navi-widget__header').exists({ count: 2 }, 'Two widgets loaded');
    assert.dom('.c3-chart-component').exists({ count: 1 }, 'One visualization loaded');
    assert.dom('.table-widget').exists({ count: 1 }, 'Table widget is loaded');

    //add filters
    await click('.dashboard-filters__toggle');
    await selectChoose('.dashboard-dimension-selector', 'Container');
    await selectChoose('.filter-values--dimension-select__trigger', '1');

    const widgetsWithFilterWarning = () =>
      findAll('.navi-widget__filter-errors-icon').map((el) => el.closest('.navi-widget__title').textContent.trim());

    assert.deepEqual(
      widgetsWithFilterWarning(),
      ['Report 12'],
      'Widget with bardOne datasource has a warning that filter does not apply'
    );

    //add another filter for other datasource
    await click('.dashboard-filters--expanded__add-filter-button');
    await selectChoose('.dashboard-dimension-selector', 'Age');
    await selectChoose(findAll('.filter-values--dimension-select__trigger')[1], '1');

    assert.deepEqual(
      widgetsWithFilterWarning(),
      ['Report 12', 'Untitled Widget'],
      'Both widgets have a warning that filter does not apply'
    );

    await click('.navi-dashboard__save-button');
    assert.equal(currentURL(), '/dashboards/8/view', 'Dashboard saves without issue');
  });
});
