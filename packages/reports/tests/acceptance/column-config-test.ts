import { module, test, skip } from 'qunit';
import { findAll, visit, click, fillIn, blur, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { clickItem } from 'navi-reports/test-support/report-builder';
//@ts-ignore
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
import { reorderColumns } from 'navi-reports/test-support/column-config';

function getColumns() {
  return findAll('.navi-column-config-item__name').map((el) => el.textContent?.trim());
}

async function getRequestURL() {
  await click('.get-api__action-btn');
  const url = (find('.get-api__api-input') as HTMLInputElement).value;
  await click('.get-api__cancel-btn');
  return new URL(url);
}

async function newReport() {
  await visit('/reports/new');
  await click('.report-builder-source-selector__source-button[data-source-name="Bard One"]');
  await click('.report-builder-source-selector__source-button[data-source-name="Network"]');
  await animationsSettled();
}

module('Acceptance | Navi Report | Column Config', function (hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('Existing report loads correct columns', async function (assert) {
    await visit('reports/1/edit');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Property (id)', 'Ad Clicks', 'Nav Link Clicks'],
      'Existing report loads columns correctly'
    );

    assert.dom('.navi-column-config-item--open').doesNotExist('No columns are open when an existing report is loaded');
  });

  test('Creating new report shows column config', async function (assert) {
    await newReport();

    assert.ok(currentURL().endsWith('/edit'), 'We are on the edit report route');

    assert.dom('.navi-column-config').exists('The column config exists on the edit route');
    await click('.navi-report__run-btn');

    assert.dom('.navi-column-config').exists('The column config exists after running the report');

    await animationsSettled();
    assert.deepEqual(getColumns(), [], 'Initially no columns are present');
  });

  test('accordion behavior and highlighting last added item', async function (assert) {
    await newReport();
    assert.deepEqual(getColumns(), [], 'Initially no columns are present');

    //add Date Time
    await clickItem('timeDimension', 'Date Time');
    await animationsSettled();
    assert.dom('.navi-column-config-item').hasClass('navi-column-config-item--open', 'Date time config is open');
    assert
      .dom('.navi-column-config-item')
      .hasClass('navi-column-config-item--last-added', 'Date time column is highlighted');

    //add a dimension
    await clickItem('dimension', 'Age');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Only Age dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, true],
      'Only Age dimension is highlighted'
    );

    //remove the dimension
    await click(findAll('.navi-column-config-item__remove-icon')[1]);
    await animationsSettled();
    assert
      .dom('.navi-column-config-item')
      .doesNotHaveClass(
        'navi-column-config-item--last-added',
        'Date time column is not highlighted when all columns are removed'
      );

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Only Browser dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, true],
      'Only Browser dimension is highlighted'
    );

    //remove Age dimension
    await click(findAll('.navi-column-config-item__remove-icon')[1]);
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Browser dimension is still open after removing Age'
    );

    await click('.navi-column-config-item__name[title="Date Time (Day)"]');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Week');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [true, false],
      'Date time is still open after changing the time grain'
    );
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('Date time is not highlighted after changing the time grain');

    //add duplicate Browser dimension
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Only most recent Browser dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, true],
      'Only most recent Browser dimension is highlighted'
    );

    await click('.navi-column-config-item__name[title="Browser (id)"]');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, true, false],
      'Only clicked Browser dimension is open'
    );

    //clone dimension
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true],
      'Only cloned dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true],
      'Only cloned dimension is highlighted'
    );
    //close open config
    await click(findAll('.navi-column-config-item__name[title="Browser (id)"]')[2]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after closing the open column');

    //remove last added column
    await click(findAll('.navi-column-config-item__remove-icon')[3]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing an open column');
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('No column is highlighted after removing  an open column');

    //remove previous column
    await click(findAll('.navi-column-config-item__remove-icon')[2]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing a closed column');
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('No column is highlighted after removing  a closed column');

    //save, add Browser, revert
    await click('.navi-report__save-btn');
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    await click('.navi-report__revert-btn');
    assert
      .dom('.navi-column-config-item--open')
      .doesNotExist('The existing Browser dimension is not open after revert');
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('The existing Browser dimension is not highlighted after revert');

    //add a metric
    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, true],
      'Only Ad Clicks metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, true],
      'Only Ad Clicks metric is highlighted'
    );

    //clone metric
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true],
      'Only cloned metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true],
      'Only cloned metric is highlighted'
    );

    //remove last added column
    await click(findAll('.navi-column-config-item__remove-icon')[3]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing the metric');
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('No column is highlighted after removing the metric');

    //add a parameterized metric
    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true],
      'Only Platform Revenue metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true],
      'Only Platform Revenue metric is highlighted'
    );

    //clone parameterized metric
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, true],
      'Only cloned parameterized metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, true],
      'Only cloned parameterized metric is highlighted'
    );

    //open first parameterized metric config
    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]');
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true, false],
      'The first parameterized metric is open'
    );

    //change parameter
    await selectChoose('.navi-column-config-item__parameter-trigger', 'CAD (Dollars)');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map((el) => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true, false],
      'The first parameterized metric is still open after parameter change'
    );

    //remove the first parameterizde metric
    await click(findAll('.navi-column-config-item__remove-icon')[3]);
    assert
      .dom('.navi-column-config-item--open')
      .doesNotExist('No column is open after removing the first parameterized metric');
    assert
      .dom('.navi-column-config-item--last-added')
      .doesNotExist('No column is highlighted after removing the parameterized metric');
  });

  test('adding, removing and changing a sort', async function (assert) {
    assert.expect(6);
    await newReport();

    await clickItem('dimension', 'Date Time');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Time Grain Type'],
      'The sort direction is not listed'
    );

    await click('.navi-column-config-base__sort-icon');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Sort Direction', 'Time Grain Type'],
      'A sort direction is applied and becomes the first parameter'
    );

    assert
      .dom('.navi-column-config-item__parameter-trigger')
      .hasText('Descending', 'The sort is descending by default');

    await click('.navi-column-config-item__parameter-trigger');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['None', 'Descending', 'Ascending'],
      'The sort options are listed'
    );

    await selectChoose('.navi-column-config-item__parameter-trigger', 'Ascending');
    assert.dom('.navi-column-config-item__parameter-trigger').hasText('Ascending', 'The sort is updated to ascending');

    await selectChoose('.navi-column-config-item__parameter-trigger', 'None');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Time Grain Type'],
      'The sort direction is not listed'
    );
  });

  test('toggling a sort', async function (assert) {
    assert.expect(3);
    await newReport();

    await clickItem('dimension', 'Date Time');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Time Grain Type'],
      'The sort direction is not listed'
    );

    await click('.navi-column-config-base__sort-icon');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Sort Direction', 'Time Grain Type'],
      'A sort direction is applied and becomes the first parameter'
    );

    await click('.navi-column-config-base__sort-icon');
    assert.deepEqual(
      findAll('.navi-column-config-item__parameter-label').map((el) => el.textContent?.trim()),
      ['Time Grain Type'],
      'The sort direction is toggled off when clicking the icon again'
    );
  });

  test('reordering columns', async function (assert) {
    assert.expect(2);
    await newReport();

    await clickItem('dimension', 'Date Time');
    await clickItem('dimension', 'Age');
    await clickItem('metric', 'Revenue');
    await clickItem('dimension', 'Browser');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age (id)', 'Browser (id)', 'Revenue (USD)'],
      'The columns are ordered correctly'
    );

    await reorderColumns('browser(field=id)', 'age(field=id)', 'revenue(currency=USD)', 'network.dateTime(grain=day)');

    assert.deepEqual(
      getColumns(),
      ['Browser (id)', 'Age (id)', 'Revenue (USD)', 'Date Time (Day)'],
      'The columns are reordered'
    );
  });

  test('adding columns after reordering', async function (assert) {
    assert.expect(3);
    await newReport();

    await clickItem('dimension', 'Date Time');
    await clickItem('dimension', 'Age');
    await clickItem('metric', 'Revenue');
    await clickItem('dimension', 'Browser');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age (id)', 'Browser (id)', 'Revenue (USD)'],
      'The columns are ordered correctly'
    );

    await reorderColumns('browser(field=id)', 'age(field=id)', 'revenue(currency=USD)', 'network.dateTime(grain=day)');

    assert.deepEqual(
      getColumns(),
      ['Browser (id)', 'Age (id)', 'Revenue (USD)', 'Date Time (Day)'],
      'The columns are reordered'
    );

    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('dimension', 'Date Time');
    await clickItem('dimension', 'Currency');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      [
        'Browser (id)',
        'Age (id)',
        'Currency (id)',
        'Revenue (USD)',
        'Date Time (Day)',
        'Date Time (Day)',
        'Nav Link Clicks',
        'Ad Clicks',
      ],
      'The columns are ordered correctly'
    );
  });

  test('clicking filter button always adds a new filter', async function (assert) {
    assert.expect(3);
    await newReport();

    assert.dom('.filter-builder__subject').exists({ count: 1 }, 'There is 1 filter to start');
    await clickItem('dimension', 'Age');

    await click('.navi-column-config-base__filter-icon');
    assert.dom('.filter-builder__subject').exists({ count: 2 }, 'Clicking the filter button adds a new filter');

    await click('.navi-column-config-base__filter-icon');
    assert.dom('.filter-builder__subject').exists({ count: 3 }, 'Clicking the filter button again adds a new filter');
  });

  test('adding - metrics', async function (assert) {
    await newReport();

    assert.deepEqual(getColumns(), [], 'Initially there are no columns');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Ad Clicks', 'Nav Link Clicks'], 'Metrics are added');

    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'], 'Duplicate metrics can be added');
  });

  test('removing - metrics from start and end', async function (assert) {
    assert.expect(3);
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Ad Clicks', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[0]); // Remove first Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[3]); // Remove last Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks'],
      'Duplicate metrics can be removed'
    );
  });

  test('adding - dimensions', async function (assert) {
    assert.expect(3);
    await newReport();

    assert.deepEqual(getColumns(), [], 'Initially no columns are visible');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Age (id)', 'Browser (id)'], 'Dimensions are added after date time');

    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Age (id)', 'Browser (id)', 'Age (id)'], 'Duplicate dimensions can be added');
  });

  test('removing - dimensions from start and end', async function (assert) {
    assert.expect(3);
    await newReport();

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Age (id)', 'Browser (id)', 'Age (id)', 'Browser (id)', 'Age (id)'],
      'Duplicate dimensions can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[0]); // Remove first age

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Browser (id)', 'Age (id)', 'Browser (id)', 'Age (id)'],
      'Duplicate dimensions can be added removed'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[3]); // Remove last age

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Browser (id)', 'Age (id)', 'Browser (id)'], 'Duplicate metrics can be added');
  });

  test('adding - metrics and dimensions', async function (assert) {
    assert.expect(2);
    await newReport();

    assert.deepEqual(getColumns(), [], 'Initially no columns are visible');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('dimension', 'Age');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('dimension', 'Date Time');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Date Time');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Date Time (Day)', 'Age (id)', 'Browser (id)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Dimensions, then metrics are displayed in the column config'
    );
  });

  skip('config - renaming - date time', async function (assert) {
    assert.expect(4);
    await newReport();

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');

    await fillIn('.navi-column-config-base__column-name-input', 'My time');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name')
      .hasAttribute('title', 'My time', 'The title attribute is updated to the user input');
    assert.dom('.navi-column-config-item__name').hasText('My time', 'The title text is updated to the user input');

    await click('.navi-column-config-item__name[title="My time"]'); // close config

    assert.deepEqual(getColumns(), ['My time'], 'The date time column name is changed');
  });

  skip('config - renaming - metrics', async function (assert) {
    assert.expect(7);
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'The initial metrics were added'
    );

    assert
      .dom('.navi-column-config-item__name[title="Ad Clicks 2"]')
      .doesNotExist('There is no "Ad Clicks" column before');
    await fillIn('.navi-column-config-base__column-name-input', 'Ad Clicks 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Ad Clicks 2"]')
      .exists('The "Ad Clicks 2" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks 2'],
      'The second instance of a metric can be renamed'
    );

    assert
      .dom('.navi-column-config-item__name[title="Ad Clicks 1"]')
      .doesNotExist('There is no "Ad Clicks 1" column before');
    await click('.navi-column-config-item__name[title="Ad Clicks"]'); // open first Ad Clicks config
    await fillIn('.navi-column-config-base__column-name-input', 'Ad Clicks 1');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Ad Clicks 1"]')
      .exists('The "Ad Clicks 1" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks 1', 'Nav Link Clicks', 'Ad Clicks 2'],
      'The first instance of a metric can be renamed'
    );
  });

  skip('config - renaming - parameterized metrics', async function (assert) {
    assert.expect(7);
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'button click count');
    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The initial parameterized metrics were added'
    );

    assert
      .dom('.navi-column-config-item__name[title="Platform Revenue (USD) 2"]')
      .doesNotExist('There is no "Platform Revenue (USD) 2" column before');
    await fillIn('.navi-column-config-base__column-name-input', 'Platform Revenue (USD) 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Platform Revenue (USD) 2"]')
      .exists('The "Platform Revenue (USD) 2" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD) 2'],
      'The second instance of a parameterized metric can be renamed'
    );

    assert
      .dom('.navi-column-config-item__name[title="Platform Revenue (USD) 1"]')
      .doesNotExist('There is no "Platform Revenue (USD) 1" column before');
    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]'); // open first Platform Revenue (USD) config
    await fillIn('.navi-column-config-base__column-name-input', 'Platform Revenue (USD) 1');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Platform Revenue (USD) 1"]')
      .exists('The "Platform Revenue (USD) 1" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD) 1', 'button click count (l)', 'Platform Revenue (USD) 2'],
      'The first instance of a parameterized metric can be renamed'
    );
  });

  skip('config - renaming - dimensions', async function (assert) {
    assert.expect(7);
    await newReport();

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'The initial dimensions were added');

    assert.dom('.navi-column-config-item__name[title="Age 2"]').doesNotExist('There is no "Age 2" column before');
    await fillIn('.navi-column-config-base__column-name-input', 'Age 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Age 2"]')
      .exists('The "Age 2" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age', 'Browser', 'Age 2'],
      'The second instance of a dimension can be renamed'
    );

    assert.dom('.navi-column-config-item__name[title="Age 1"]').doesNotExist('There is no "Age 1" column before');
    await click('.navi-column-config-item__name[title="Age"]'); // open first age config
    await fillIn('.navi-column-config-base__column-name-input', 'Age 1');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Age 1"]')
      .exists('The "Age 1" column is found after updating the name');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age 1', 'Browser', 'Age 2'],
      'The first instance of a dimension can be renamed'
    );
  });

  test('config - parameters - metrics change first instance parameter', async function (assert) {
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'button click count');
    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The initial parameterized metrics were added'
    );

    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]'); // open first Platform Revenue (USD) config
    await selectChoose('.navi-column-config-item__parameter-trigger', 'CAD (Dollars)');

    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (CAD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The first instance of a parameterized metric can be renamed'
    );
  });

  test('config - parameters - metrics change last instance parameter', async function (assert) {
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'button click count');
    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The initial parameterized metrics were added'
    );

    await selectChoose('.navi-column-config-item__parameter-trigger', 'CAD (Dollars)');

    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (CAD)'],
      'The second instance of a parameterized metric can be renamed'
    );
  });

  test('config - clone - dimension', async function (assert) {
    await newReport();

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Age (id)', 'Browser (id)'], 'The initial dimensions were added');

    await click('.navi-column-config-item__name[title="Age (id)"]');
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(getColumns(), ['Age (id)', 'Browser (id)', 'Age (id)'], 'The dimension can be cloned');

    // TODO: uncomment when relabeling works
    /**
     * await click(findAll('.navi-column-config-item__name[title="Age"]')[1]);
     * await fillIn('.navi-column-config-base__column-name-input', 'Age 2');
     * await blur('.navi-column-config-base__column-name-input');
     * await click('.navi-column-config-item__name[title="Age 2"]');
     *
     * await animationsSettled();
     * assert.deepEqual(
     *   getColumns(),
     *   ['Date Time (Day)', 'Age', 'Browser', 'Age 2'],
     *   'The cloned dimension can be renamed'
     * );
     *
     * await click(findAll('.navi-column-config-item__remove-icon')[3]);
     *
     * await animationsSettled();
     * assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser'], 'The cloned dimension is deleted correctly');
     */
  });

  test('config - clone - metric', async function (assert) {
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Ad Clicks', 'Nav Link Clicks'], 'The initial metrics were added');

    await click('.navi-column-config-item__name[title="Ad Clicks"]');
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(getColumns(), ['Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'], 'The metric can be cloned');

    // TODO: uncomment when relabeling works
    /**
     * await click(findAll('.navi-column-config-item__name[title="Ad Clicks"]')[1]);
     * await fillIn('.navi-column-config-base__column-name-input', 'Ad Clicks 2');
     * await blur('.navi-column-config-base__column-name-input');
     * await click('.navi-column-config-item__name[title="Ad Clicks 2"]');
     *
     * await animationsSettled();
     * assert.deepEqual(
     *   getColumns(),
     *   ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks 2'],
     *   'The cloned metric can be renamed'
     * );
     *
     * await click(findAll('.navi-column-config-item__remove-icon')[3]);
     *
     * await animationsSettled();
     * assert.deepEqual(
     *   getColumns(),
     *   ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
     *   'The cloned metric is deleted correctly'
     * );
     */
  });

  test('config - clone - parameterized metric', async function (assert) {
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Platform Revenue (USD)', 'Nav Link Clicks'], 'The initial metrics were added');
    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]');
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (USD)', 'Nav Link Clicks', 'Platform Revenue (USD)'],
      'The metric can be cloned'
    );

    // TODO: uncomment when relabeling works
    /**
     * await click(findAll('.navi-column-config-item__name[title="Platform Revenue (USD)"]')[1]);
     * await blur('.navi-column-config-base__column-name-input');
     * await selectChoose('.navi-column-config-item__parameter-trigger', 'Dollars (CAD)');
     * assert
     *   .dom(findAll('.navi-column-config-item__name')[3])
     *   .hasText('Platform Revenue (CAD)', 'Text is set back to default when parameter changes');
     * await fillIn('.navi-column-config-base__column-name-input', 'My (CAD) dollars');
     *
     * await animationsSettled();
     * assert.deepEqual(
     *   getColumns(),
     *   ['Date Time (Day)', 'Platform Revenue (USD)', 'Nav Link Clicks', 'My (CAD) dollars'],
     *   'The cloned metric can be renamed'
     * );
     */

    await click(findAll('.navi-column-config-item__remove-icon')[2]);

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (USD)', 'Nav Link Clicks'],
      'The cloned metric is deleted correctly'
    );
  });

  skip('config - duplicate columns - can configure multiple of the same base metrics', async function (assert) {
    assert.expect(2);
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'The initial metrics were added'
    );

    await click(findAll('.navi-column-config-item__name[title="Ad Clicks"]')[0]);
    await click(findAll('.navi-column-config-item__name[title="Ad Clicks"]')[1]);
    await fillIn(findAll('.navi-column-config-base__column-name-input')[0], 'Ad Clicks 1');
    await fillIn(findAll('.navi-column-config-base__column-name-input')[1], 'Ad Clicks 2');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks 1', 'Nav Link Clicks', 'Ad Clicks 2'],
      'Both metrics were  updated at the same time'
    );
  });

  skip('config - duplicate columns - can configure multiple of the same base dimension', async function (assert) {
    assert.expect(2);
    await newReport();

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'The initial dimensions were added');

    await click(findAll('.navi-column-config-item__name[title="Age"]')[0]);
    await click(findAll('.navi-column-config-item__name[title="Age"]')[1]);
    await fillIn(findAll('.navi-column-config-base__column-name-input')[0], 'Age 1');
    await fillIn(findAll('.navi-column-config-base__column-name-input')[1], 'Age 2');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age 1', 'Browser', 'Age 2'],
      'Both dimensions were updated at the same time'
    );
  });

  skip('config - filters - dimensions - expand on add', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(9);
    await newReport();

    await clickItem('dimension', 'Age');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass(
        'report-builder__container--filters--collapsed',
        'Filters are opened after adding a metric filter'
      );

    assert.dom(findAll('.filter-builder__subject')[0]).hasText('Age', 'Dimension filter is added');

    await clickItem('dimension', 'Age');
    await animationsSettled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter icon of the duplicate dimension is active');

    await click('.navi-column-config-base__filter-icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter icon of the duplicate dimension is not active'
      );
    await click('.navi-column-config-item__name[title="Age"]'); // open first Age dimension
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter icon of the first dimension is not active'
      );

    assert
      .dom('.filter-builder__subject .name')
      .doesNotExist('Dimension filter is removed when clicked on duplicate dimension');
  });

  skip('config - filters - metrics - expand on add', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(9);
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass(
        'report-builder__container--filters--collapsed',
        'Filters are opened after adding a metric filter'
      );

    assert
      .dom(findAll('.filter-builder__subject')[0])
      .hasText('Date Time Day', 'Date Dimension is properly labeled in filters');

    assert.dom(findAll('.filter-builder__subject')[1]).hasText('Ad Clicks', 'Metric filter is added');

    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter of the duplicate metric is active');

    await click('.navi-column-config-base__filter-icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter icon of the duplicate metric is not active'
      );
    await click('.navi-column-config-item__name[title="Ad Clicks"]'); // open first Ad Clicks metric
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter icon of the first metric is not active'
      );

    assert
      .dom('.filter-builder__subject')
      .exists({ count: 1 }, 'Metric filter is removed when clicked on duplicate metric');
  });

  skip('config - filters - parameterized metrics - expand on add', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(10);
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass(
        'report-builder__container--filters--collapsed',
        'Filters are opened after adding a metric filter'
      );

    assert
      .dom(findAll('.filter-builder__subject')[0])
      .hasText('Date Time Day', 'Date Dimension is properly labeled in filters');

    assert.dom(findAll('.filter-builder__subject')[1]).hasText('Platform Revenue USD', 'Metric filter is added');

    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the duplicate parameterized metric is active after being added'
      );

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the duplicate parameterized metric is not active'
      );

    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]'); // open first parameterized metric
    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the first parameterized metric is not active'
      );

    assert
      .dom('.filter-builder__subject')
      .exists({ count: 1 }, 'Metric filter is removed when clicked on duplicate metric');
  });

  skip('config - filters - parameterized metrics - different parameters make different filters', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(10);
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]'); // open first parameterized metric
    await click('.navi-column-config-base__filter-icon');

    assert
      .dom(findAll('.filter-builder__subject')[0])
      .hasText('Date Time Day', 'Date Time dimension rendered correctly');

    assert.dom(findAll('.filter-builder__subject')[1]).hasText('Platform Revenue USD', 'Metric filter is added');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the first parameterized metric is active'
      );

    await click(findAll('.navi-column-config-item__name[title="Platform Revenue (USD)"]')[1]); // open second parameterized metric
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Dollars (CAD)');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'Platform Revenue (CAD)'],
      'The second metric was updated'
    );

    assert
      .dom('.navi-column-config-base__filter-icon')
      .doesNotHaveClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the changed parameterized metric is not active'
      );

    await click('.navi-column-config-base__filter-icon');
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the second parameterized metric is active'
      );

    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]'); // open second parameterized metric
    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass(
        'navi-column-config-base__filter-icon--active',
        'The filter of the first parameterized metric is still active'
      );

    assert
      .dom(findAll('.filter-builder__subject')[0])
      .hasText('Date Time Day', 'Date Time dimension is rendered correctly');

    assert
      .dom(findAll('.filter-builder__subject')[1])
      .hasText('Platform Revenue CAD', 'First metric is rendered correct');

    assert
      .dom(findAll('.filter-builder__subject')[2])
      .hasText('Platform Revenue USD', 'Second metric is rendered correctly');
  });

  skip('config - filters - metrics - stay collapsed on remove', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(4);
    await newReport();

    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters stay collapsed when a filter is removed');
  });

  skip('config - filters - parameterized metrics - stay collapsed on remove', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(4);
    await newReport();

    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters stay collapsed when a filter is removed');
  });

  skip('config - filters - dimensions - stay collapsed on remove', async function (assert) {
    //TODO update when filter updates are complete
    assert.expect(4);
    await newReport();

    await clickItem('dimension', 'Age');
    await animationsSettled();

    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--filters--collapsed', 'Filters are open by default');
    await click('.report-builder__container-header__filters-toggle-icon');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.navi-column-config-base__filter-icon')
      .hasClass('navi-column-config-base__filter-icon--active', 'The filter is active after being added');

    await click('.report-builder__container-header__filters-toggle-icon');
    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters are collapsed after click');

    await click('.navi-column-config-base__filter-icon');

    assert
      .dom('.report-builder__container--filters')
      .hasClass('report-builder__container--filters--collapsed', 'Filters stay collapsed when a filter is removed');
  });

  test('config - parameterized metric - search parameters', async function (assert) {
    await newReport();

    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Platform Revenue (USD)'], 'The initial metrics was added');

    await click('.navi-column-config-item__parameter-trigger');
    assert.strictEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()).length,
      14,
      'All options are shown initially'
    );
    await fillIn('.ember-power-select-search-input', 'Dollars');
    assert.deepEqual(
      findAll('.ember-power-select-option').map((el) => el.textContent?.trim()),
      ['AUD (Dollars)', 'CAD (Dollars)', 'USD (Dollars)'],
      'After searching only the filtered metric is shown'
    );
    await click(findAll('.ember-power-select-option')[1]);

    assert.deepEqual(
      getColumns(),
      ['Platform Revenue (CAD)'],
      'Clicking the filtered option changes the metrics parameter'
    );

    await click(findAll('.grouped-list__group-header').filter((el) => el.textContent?.includes('Revenue'))[0]);
  });

  skip('Sort gets removed when metric is removed', async function (assert) {
    //TODO update when table updates are complete
    assert.expect(6);
    await newReport();

    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Platform Revenue (USD)'], 'The initial metrics was added');
    await click('.navi-report__run-btn');

    await click('.table-header-row .table-header-cell.metric .navi-table-sort-icon');

    let apiURL = await getRequestURL();
    assert.equal(apiURL.searchParams.get('sort'), 'platformRevenue(currency=USD)|desc', 'Sort is included in request');

    //removing metric from column config
    await click(findAll('.navi-column-config-item__remove-icon')[1]);

    apiURL = await getRequestURL();
    assert.notOk(apiURL.searchParams.has('sort'), 'Sort is removed from request when metric is removed');

    //test param changing
    await newReport();

    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Platform Revenue (USD)'], 'The initial metrics was added');
    await click('.navi-report__run-btn');

    await click('.table-header-row .table-header-cell.metric .navi-table-sort-icon');

    apiURL = await getRequestURL();
    assert.equal(apiURL.searchParams.get('sort'), 'platformRevenue(currency=USD)|desc', 'Sort is included in request');

    //changing metric param
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Dollars (CAD)');

    apiURL = await getRequestURL();
    assert.notOk(apiURL.searchParams.has('sort'), 'Sort is removed from request when metric params changed');
  });

  test('Rollup test', async function (assert) {
    assert.expect(8);
    await visit('/reports/1/view');
    let apiURL = await getRequestURL();
    assert.equal(
      apiURL.href,
      'https://data.naviapp.io/v1/data/network/day/property;show=id/?dateTime=2015-11-09T00%3A00%3A00.000%2F2015-11-16T00%3A00%3A00.000&metrics=adClicks%2CnavClicks&sort=navClicks%7Casc&format=json',
      'Default query with no rollup'
    );

    await click('span[title="Date Time (Day)"]');
    await click('.navi-column-config-base__rollup-icon');

    apiURL = await getRequestURL();
    assert.equal(
      apiURL.href,
      'https://data.naviapp.io/v1/data/network/day/property;show=id/__rollupMask/?dateTime=2015-11-09T00%3A00%3A00.000%2F2015-11-16T00%3A00%3A00.000&metrics=adClicks%2CnavClicks&sort=navClicks%7Casc&rollupTo=dateTime&format=json',
      'Datetime rollup added to query'
    );

    await click('span[title="Date Time (Day)"]');
    await click('span[title="Property (id)"]');
    await click('.navi-column-config-base__rollup-icon');

    apiURL = await getRequestURL();
    assert.equal(
      apiURL.href,
      'https://data.naviapp.io/v1/data/network/day/property;show=id/__rollupMask/?dateTime=2015-11-09T00%3A00%3A00.000%2F2015-11-16T00%3A00%3A00.000&metrics=adClicks%2CnavClicks&sort=navClicks%7Casc&rollupTo=dateTime%2Cproperty&format=json',
      'Property rollup added to query'
    );

    await click('.navi-report__run-btn');

    await click('.visualization-toggle__option-icon[title="Data Table"]');
    assert.dom('.table-row__rollup-row').exists('Table visualization has rollup styled rows');

    await click('.navi-column-config__grandtotal-icon');

    apiURL = await getRequestURL();
    assert.equal(
      apiURL.href,
      'https://data.naviapp.io/v1/data/network/day/property;show=id/__rollupMask/?dateTime=2015-11-09T00%3A00%3A00.000%2F2015-11-16T00%3A00%3A00.000&metrics=adClicks%2CnavClicks&sort=navClicks%7Casc&rollupTo=dateTime%2Cproperty&rollupGrandTotal=true&format=json',
      'grandTotal added to query'
    );

    await click('.navi-report__run-btn');

    assert.dom('.table-row__rollup-row').exists('Table visualization has rollup styled rows');

    await click('.navi-column-config-base__rollup-icon');
    await click('span[title="Property (id)"]');
    await click('span[title="Date Time (Day)"]');
    await click('.navi-column-config-base__rollup-icon');
    await click('.navi-column-config__grandtotal-icon');

    apiURL = await getRequestURL();
    assert.equal(
      apiURL.href,
      'https://data.naviapp.io/v1/data/network/day/property;show=id/?dateTime=2015-11-09T00%3A00%3A00.000%2F2015-11-16T00%3A00%3A00.000&metrics=adClicks%2CnavClicks&sort=navClicks%7Casc&format=json',
      'Rollup removed from query after toggling off both dimensions'
    );

    await click('.navi-report__run-btn');

    assert
      .dom('.table-row__rollup-row')
      .doesNotExist('Table visualization has all rollup styled rows removed after toggling off both dimensions');
  });
});
