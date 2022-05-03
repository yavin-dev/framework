import { module, test } from 'qunit';
import { visit, click, findAll, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItem } from 'navi-reports/test-support/report-builder';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { getStatus, getDataSourceStatuses, DATE_FORMAT } from 'navi-core/test-support/data-availability';
import moment from 'moment';

module('Acceptance | Multi datasource Dashboard', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('Load multi-datasource dashboard', async function (assert) {
    assert.expect(13);
    await visit('/dashboards/6/view');

    assert.dom('.navi-widget__header').exists({ count: 3 }, 'Three widgets loaded');
    assert.dom('.c3-chart-component').exists({ count: 3 }, 'Three visualizations loaded');

    assert.dom('.navi-widget__filter-errors-icon').exists({ count: 3 }, 'Filter warning is shown on each widget');

    assert
      .dom('.filter-collection--collapsed')
      .containsText('Date Time (Day) in the past 7 days', 'Collapsed date dimension filter has the right text');

    assert
      .dom('.filter-collection--collapsed')
      .containsText(
        'Age (id) equals 1 2 3 Container (id) not equals 1',
        'Collapsed dimension filters have the right text'
      );

    await click('.dashboard-filters__toggle');

    assert
      .dom(findAll('.filter-builder__subject .name')[0])
      .hasText('Date Time', 'Date Dimension is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .chips')[0])
      .hasText('Day', 'Date Dimension grain is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .name')[1])
      .hasText('Age', 'Dimension 1 is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .chips')[1])
      .hasText('id', 'Dimension 1 parameter is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .name')[2])
      .hasText('Container', 'Dimension 2 is properly labeled in filters');

    assert
      .dom(findAll('.filter-builder__subject .chips')[2])
      .hasText('id', 'Dimension 2 parameter is properly labeled in filters');

    assert.deepEqual(
      findAll('.filter-builder__operator-trigger').map((el) => el.textContent.trim()),
      ['In The Past', 'Equals', 'Not Equals'],
      'Dimension filter operators are shown correctly'
    );

    assert.deepEqual(
      findAll('.filter-values--dimension-select__trigger').map((el) =>
        [...el.querySelectorAll('.filter-values--dimension-select__option')].map((el) => el.textContent.trim())
      ),
      [['1', '2', '3'], ['1']],
      'Dimension value selector showing the right values'
    );
  });

  test('Create new multisource dashboard', async function (assert) {
    assert.expect(10);

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

    await click('.filter-collection__remove');
    await click('.filter-collection__remove');

    assert.deepEqual(
      widgetsWithFilterWarning(),
      [],
      'Filters removed, no widget has a warning that filter does not apply'
    );

    //add date filter for first datasource
    await selectChoose('.dashboard-dimension-selector', 'Date Time');
    assert.deepEqual(
      widgetsWithFilterWarning(),
      ['Untitled Widget'],
      'Widget with bardTwo datasource has a warning that filter does not apply'
    );
  });

  test('Data availability', async function (assert) {
    await visit('/dashboards/6/view');

    assert.strictEqual(getStatus(), 'delayed', 'availability status is delayed since there are conflicting');
    await clickTrigger('.data-availability');

    const bardOneDate = moment.utc().startOf('day').format(DATE_FORMAT);
    const bardTwoDate = moment.utc().subtract(2, 'day').startOf('hour').format(DATE_FORMAT);

    assert.deepEqual(
      getDataSourceStatuses(),
      [
        { status: 'delayed', name: 'Bard One', date: bardOneDate },
        { status: 'late', name: 'Bard Two', date: bardTwoDate },
      ],
      'availability summary shows both datasources since they are both visible on the dashboard'
    );

    const widgetDeleteButtons = findAll('.navi-widget__delete-btn');
    await click(widgetDeleteButtons[0]);
    await click('.delete__modal-delete-btn');
    await click(widgetDeleteButtons[2]);
    await click('.delete__modal-delete-btn');

    assert.strictEqual(getStatus(), 'late', 'availability status is updated to only datasource shown on dashboard');
    await clickTrigger('.data-availability');

    assert.deepEqual(
      getDataSourceStatuses(),
      [{ status: 'late', name: 'Bard Two', date: bardTwoDate }],
      'availability summary only shows bard two datasource since bard one widgets were deleted'
    );
  });
});
