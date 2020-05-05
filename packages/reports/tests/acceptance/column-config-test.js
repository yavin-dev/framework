import { module, test, skip } from 'qunit';
import { findAll, visit, click, fillIn, blur, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { clickItem, clickMetricConfigTrigger } from 'navi-reports/test-support/report-builder';
import { setupAnimationTest, animationsSettled } from 'ember-animated/test-support';
import { selectChoose } from 'ember-power-select/test-support';

let OriginalEnableRequestPreview;

module('Acceptance | Navi Report | Column Config', function(hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    OriginalEnableRequestPreview = config.navi.FEATURES.enableRequestPreview;
    config.navi.FEATURES.enableRequestPreview = true;
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableRequestPreview = OriginalEnableRequestPreview;
  });

  test('Existing report loads correct columns', async function(assert) {
    assert.expect(1);
    await visit('reports/1/view');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Existing report loads columns correctly'
    );
  });

  test('Creating new report shows column config if enableRequestPreview is on', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');

    assert.ok(currentURL().endsWith('/edit'), 'We are on the edit report route');

    assert.dom('.navi-column-config').exists('The column config exists on the edit route');
    await click('.navi-report__run-btn');

    assert.dom('.navi-column-config').exists('The column config exists after running the report');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
  });

  test('Creating new report does not show column config without enableRequestPreview', async function(assert) {
    assert.expect(3);
    config.navi.FEATURES.enableRequestPreview = false;
    await visit('/reports/new');

    assert.ok(currentURL().endsWith('/edit'), 'We are on the edit report route');

    assert.dom('.navi-column-config').doesNotExist('The column config is not present with feature flag disabled');
    await click('.navi-report__run-btn');

    assert.dom('.navi-column-config').doesNotExist('The column config is not present after running the report either');
  });

  test('toggle columns drawer', async function(assert) {
    assert.expect(6);

    await visit('reports/1/view');

    assert.dom('.navi-column-config__panel').exists('Column config drawer is open by default');
    assert
      .dom('.report-view__columns-icon.fa-chevron-left')
      .exists('Column config drawer displays "back" icon when open');

    await click('.report-view__columns-button');
    await animationsSettled();
    assert
      .dom('.navi-column-config__panel')
      .doesNotExist('Column config drawer is closed after toggling the columns button');
    assert
      .dom('.report-view__columns-icon.fa-columns')
      .exists('Column config drawer displays "column" icon when closed');

    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after toggling the columns button');
    assert
      .dom('.report-view__columns-icon.fa-chevron-left')
      .exists('Column config drawer displays "back" icon when open');
  });

  test('columns drawer - opens when adding', async function(assert) {
    assert.expect(12);

    await visit('/reports/new');
    await click('.navi-report__run-btn');
    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially the only column is date time');

    //remove Date Time
    await click('.navi-column-config-item__remove-icon');

    //close the drawer
    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Column config drawer is closed');

    //add back Date Time
    await clickItem('timeGrain', 'Date Time');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after adding date time');

    //close the drawer
    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Column config drawer is closed');

    //add a dimension
    await clickItem('dimension', 'Age');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after adding a dimension');

    //add another dimension
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    assert
      .dom('.navi-column-config__panel')
      .exists('Column config drawer is still open after adding another dimension');

    //close the drawer
    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Column config drawer is closed');

    //add a metric
    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after adding a metric');

    //add another metric
    await clickItem('metric', 'Nav Link Clicks');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is still open after adding another metric');

    //close the drawer
    await click('.report-view__columns-button');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').doesNotExist('Column config drawer is closed');

    //add a parameterized metric
    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();
    assert.dom('.navi-column-config__panel').exists('Column config drawer is open after adding a parameterized metric');

    //add another parameterized metric
    await clickItem('metric', 'button click count');
    await animationsSettled();
    assert
      .dom('.navi-column-config__panel')
      .exists('Column config drawer is still open after adding another parameterized metric');
  });

  test('highlights last added/cloned item', async function(assert) {
    assert.expect(29);

    await visit('/reports/new');
    await click('.navi-report__run-btn');
    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially the only column is date time');

    //remove Date Time
    await click('.navi-column-config-item__remove-icon');

    //add back Date Time
    await clickItem('timeGrain', 'Date Time');
    await animationsSettled();
    assert.dom('.navi-column-config-item').hasClass('navi-column-config-item--open', 'Date time config is open');
    assert
      .dom('.navi-column-config-item')
      .hasClass('navi-column-config-item--last-added', 'Date time column is highlighted');

    //close the config
    await click('.navi-column-config-item__name[title="Date Time (Day)"]');

    //add a dimension
    await clickItem('dimension', 'Age');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true],
      'Only Age dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, true],
      'Only Age dimension is highlighted'
    );

    //add another dimension
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, true, true],
      'Age and Browser dimensions are open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, true],
      'Only Browser dimension is highlighted'
    );

    //close open configs
    await click('.navi-column-config-item__name[title="Age"]');
    await click('.navi-column-config-item__name[title="Browser"]');

    //add same dimension again
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true],
      'Only most recently added Browser dimension is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, true],
      'Only most recently added Browser dimension is highlighted'
    );

    //clone dimension
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, true, true],
      'Original and cloned dimensions are open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, true],
      'Only cloned dimension is highlighted'
    );

    //close open configs
    await click(findAll('.navi-column-config-item__name[title="Browser"]')[1]);
    await click(findAll('.navi-column-config-item__name[title="Browser"]')[2]);

    //remove last added column
    await click(findAll('.navi-column-config-item__remove-icon')[4]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing');
    assert.dom('.navi-column-config-item--last-added').doesNotExist('No column is highlighted after removing');

    //save, add Browser, revert
    await click('.navi-report__save-btn');
    await clickItem('dimension', 'Browser');
    await animationsSettled();
    await click('.navi-report__revert-btn');
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after revert');
    assert.dom('.navi-column-config-item--last-added').doesNotExist('No column is highlighted after revert');

    //add a metric
    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, true],
      'Only Ad Clicks metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, true],
      'Only Ad Clicks metric is highlighted'
    );

    //clone metric
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, true, true],
      'Original and cloned metrics are open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, true],
      'Only cloned metric is highlighted'
    );

    //close open configs
    await click('.navi-column-config-item__name[title="Ad Clicks"]');
    await click(findAll('.navi-column-config-item__name[title="Ad Clicks"]')[1]);

    //remove last added column
    await click(findAll('.navi-column-config-item__remove-icon')[5]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing');
    assert.dom('.navi-column-config-item--last-added').doesNotExist('No column is highlighted after removing');

    //add a parameterized metric
    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, false, true],
      'Only Platform Revenue metric is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, true],
      'Only Platform Revenue metric is highlighted'
    );

    //clone parameterized metric
    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, false, true, true],
      'Original and cloned parameterized metrics are open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, false, true],
      'Only cloned parameterized metric is highlighted'
    );

    //close open configs
    await click('.navi-column-config-item__name[title="Platform Revenue (USD)"]');
    await click(findAll('.navi-column-config-item__name[title="Platform Revenue (USD)"]')[1]);

    //remove last added column
    await click(findAll('.navi-column-config-item__remove-icon')[5]);
    assert.dom('.navi-column-config-item--open').doesNotExist('No column is open after removing');
    assert.dom('.navi-column-config-item--last-added').doesNotExist('No column is highlighted after removing');

    //add a parameterized metric from metric config
    const closeConfig = await clickMetricConfigTrigger('Platform Revenue');
    await clickItem('metricConfig', 'Dollars', 'CAD');
    await animationsSettled();
    await closeConfig();
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--open')),
      [false, false, false, false, false, false, true],
      'Only Platform Revenue (CAD) is open'
    );
    assert.deepEqual(
      findAll('.navi-column-config-item').map(el => el.classList.contains('navi-column-config-item--last-added')),
      [false, false, false, false, false, false, true],
      'Only Platform Revenue (CAD) is highlighted'
    );
  });

  test('adding, removing and changing - date time', async function(assert) {
    assert.expect(7);
    await visit('reports/1/view');

    assert.dom('.filter-builder__subject').hasText('Date Time (Day)', 'Time grain is initially day');

    await click('.navi-column-config-item__remove-icon'); // Remove Date Time (Day)

    assert.dom('.filter-builder__subject').hasText('Date Time (All)', 'Deselecting day changes time grain to all');
    await animationsSettled();
    assert.deepEqual(getColumns(), ['Property', 'Ad Clicks', 'Nav Link Clicks'], 'Date Time is removed');

    await clickItem('dimension', 'Date Time');
    await animationsSettled();

    assert.dom('.filter-builder__subject').hasText('Date Time (Day)', 'Default time grain (day) is set on the report');
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'A Date Time (Day) column is added'
    );
    await selectChoose('.navi-column-config-item__parameter-trigger', 'Week');

    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time (Week)', 'Choosing week changes timegrain from day to week');
    assert.deepEqual(
      getColumns(),
      ['Date Time (Week)', 'Property', 'Ad Clicks', 'Nav Link Clicks'],
      'Column is changed to Date Time (Week)'
    );
  });

  test('adding - metrics', async function(assert) {
    assert.expect(3);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'Metrics are added after date time'
    );

    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('removing - metrics from start and end', async function(assert) {
    assert.expect(3);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[1]); // Remove first Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[4]); // Remove last Ad Clicks

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Nav Link Clicks', 'Ad Clicks', 'Nav Link Clicks'],
      'Duplicate metrics can be added'
    );
  });

  test('adding - dimensions', async function(assert) {
    assert.expect(3);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser'], 'Dimensions are added after date time');

    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'Duplicate dimensions can be added');
  });

  test('removing - dimensions from start and end', async function(assert) {
    assert.expect(3);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age', 'Browser', 'Age', 'Browser', 'Age'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[1]); // Remove first age

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Browser', 'Age', 'Browser', 'Age'],
      'Duplicate metrics can be added'
    );

    await click(findAll('.navi-column-config-item__remove-icon')[4]); // Remove last age

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Browser', 'Age', 'Browser'], 'Duplicate metrics can be added');
  });

  test('adding - metrics and dimensions', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');
    await clickItem('metric', 'Ad Clicks');
    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('metric', 'Nav Link Clicks');
    await clickItem('metric', 'Ad Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age', 'Browser', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'timegrain, then dimensions, then metrics are displayed in the column config'
    );
  });

  skip('config - renaming - date time', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    assert.deepEqual(getColumns(), ['Date Time (Day)'], 'Initially only the date time is visible');

    await click('.navi-column-config-item__name[title="Date Time (Day)"]'); // open config
    await fillIn('.navi-column-config-base__column-name-input', 'My time');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name')
      .hasAttribute('title', 'My time', 'The title attribute is updated to the user input');
    assert.dom('.navi-column-config-item__name').hasText('My time', 'The title text is updated to the user input');

    await click('.navi-column-config-item__name[title="My time"]'); // close config

    assert.deepEqual(getColumns(), ['My time'], 'The date time column name is changed');
  });

  skip('config - renaming - metrics', async function(assert) {
    assert.expect(7);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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
    await click(findAll('.navi-column-config-item__name[title="Ad Clicks"]')[1]); // open second Ad Clicks config
    await fillIn('.navi-column-config-base__column-name-input', 'Ad Clicks 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Ad Clicks 2"]')
      .exists('The "Ad Clicks 2" column is found after updating the name');
    await click('.navi-column-config-item__name[title="Ad Clicks 2"]'); // close second Ad Clicks config

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
    await click('.navi-column-config-item__name[title="Ad Clicks 2"]'); // close first Ad Clicks config

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks 1', 'Nav Link Clicks', 'Ad Clicks 2'],
      'The first instance of a metric can be renamed'
    );
  });

  skip('config - renaming - parameterized metrics', async function(assert) {
    assert.expect(7);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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
    await click(findAll('.navi-column-config-item__name[title="Platform Revenue (USD)"]')[1]); // open second Platform Revenue (USD) config
    await fillIn('.navi-column-config-base__column-name-input', 'Platform Revenue (USD) 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Platform Revenue (USD) 2"]')
      .exists('The "Platform Revenue (USD) 2" column is found after updating the name');
    await click('.navi-column-config-item__name[title="Platform Revenue (USD) 2"]'); // close second Platform Revenue (USD) config

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
    await click('.navi-column-config-item__name[title="Platform Revenue (USD) 2"]'); // close first Platform Revenue (USD) config

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD) 1', 'button click count (l)', 'Platform Revenue (USD) 2'],
      'The first instance of a parameterized metric can be renamed'
    );
  });

  skip('config - renaming - dimensions', async function(assert) {
    assert.expect(7);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');
    await clickItem('dimension', 'Age');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'The initial dimensions were added');

    assert.dom('.navi-column-config-item__name[title="Age 2"]').doesNotExist('There is no "Age 2" column before');
    await click(findAll('.navi-column-config-item__name[title="Age"]')[1]); // open second age config
    await fillIn('.navi-column-config-base__column-name-input', 'Age 2');
    await blur('.navi-column-config-base__column-name-input');
    assert
      .dom('.navi-column-config-item__name[title="Age 2"]')
      .exists('The "Age 2" column is found after updating the name');
    await click('.navi-column-config-item__name[title="Age 2"]'); // close second age config

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
    await click('.navi-column-config-item__name[title="Age 2"]'); // close first age config

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Age 1', 'Browser', 'Age 2'],
      'The first instance of a dimension can be renamed'
    );
  });

  test('config - parameters - metrics change first instance parameter', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'button click count');
    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The initial parameterized metrics were added'
    );

    await selectChoose(findAll('.navi-column-config-item__parameter-trigger')[0], 'Dollars (CAD)');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (CAD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The first instance of a parameterized metric can be renamed'
    );
  });

  test('config - parameters - metrics change last instance parameter', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'button click count');
    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (USD)'],
      'The initial parameterized metrics were added'
    );

    await selectChoose(findAll('.navi-column-config-item__parameter-trigger')[2], 'Dollars (CAD)');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'button click count (l)', 'Platform Revenue (CAD)'],
      'The second instance of a parameterized metric can be renamed'
    );
  });

  test('config - clone - dimension', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('dimension', 'Age');
    await clickItem('dimension', 'Browser');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser'], 'The initial dimensions were added');

    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Age', 'Browser', 'Age'], 'The dimension can be cloned');

    // TODO: uncomment when relabeling works
    /**
     *     await click(findAll('.navi-column-config-item__name[title="Age"]')[1]);
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

  test('config - clone - metric', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks'],
      'The initial metrics were added'
    );

    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Ad Clicks', 'Nav Link Clicks', 'Ad Clicks'],
      'The metric can be cloned'
    );

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

  test('config - clone - parameterized metric', async function(assert) {
    assert.expect(3);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Nav Link Clicks');

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'Nav Link Clicks'],
      'The initial metrics were added'
    );

    await click('.navi-column-config-base__clone-icon');
    await animationsSettled();

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'Nav Link Clicks', 'Platform Revenue (USD)'],
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

    await click(findAll('.navi-column-config-item__remove-icon')[3]);

    await animationsSettled();
    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'Nav Link Clicks'],
      'The cloned metric is deleted correctly'
    );
  });

  skip('config - duplicate columns - can configure multiple of the same base metrics', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

  skip('config - duplicate columns - can configure multiple of the same base dimension', async function(assert) {
    assert.expect(2);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

  test('config - filters - dimensions - expand on add', async function(assert) {
    assert.expect(8);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

    assert.deepEqual(
      findAll('.filter-builder-dimension__subject').map(el => el.textContent.trim()),
      ['Age'],
      'Dimension filter is added'
    );

    await clickItem('dimension', 'Age');
    await animationsSettled();

    assert.dom('.navi-column-config-base__filter-icon--active').exists({ count: 2 }, 'Both filter icons are active');

    await click(findAll('.navi-column-config-base__filter-icon')[1]);
    assert
      .dom('.navi-column-config-base__filter-icon--active')
      .doesNotExist('No filters are active after being removed from duplicate dimension');

    assert.deepEqual(
      findAll('.filter-builder-dimension__subject').map(el => el.textContent.trim()),
      [],
      'Dimension filter is removed when clicked on duplicate dimension'
    );
  });

  test('config - filters - metrics - expand on add', async function(assert) {
    assert.expect(8);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Ad Clicks'],
      'Metric filter is added'
    );

    await clickItem('metric', 'Ad Clicks');
    await animationsSettled();

    assert.dom('.navi-column-config-base__filter-icon--active').exists({ count: 2 }, 'Both filter icons are active');

    await click(findAll('.navi-column-config-base__filter-icon')[1]);
    assert
      .dom('.navi-column-config-base__filter-icon--active')
      .doesNotExist('No filters are active after being removed from duplicate dimension');

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'Metric filter is removed when clicked on duplicate metric'
    );
  });

  test('config - filters - parameterized metrics - expand on add', async function(assert) {
    assert.expect(8);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Platform Revenue (USD)'],
      'Metric filter is added'
    );

    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    assert.dom('.navi-column-config-base__filter-icon--active').exists({ count: 2 }, 'Both filter icons are active');

    await click(findAll('.navi-column-config-base__filter-icon')[1]);

    assert
      .dom('.navi-column-config-base__filter-icon--active')
      .doesNotExist('No filters are active after being removed from duplicate parameterized metric');

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)'],
      'Metric filter is removed when clicked on duplicate metric'
    );
  });

  test('config - filters - parameterized metrics - different parameters make different filters', async function(assert) {
    assert.expect(6);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

    await clickItem('metric', 'Platform Revenue');
    await clickItem('metric', 'Platform Revenue');
    await animationsSettled();

    await click('.navi-column-config-base__filter-icon');

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Platform Revenue (USD)'],
      'Metric filter is added'
    );

    assert.dom('.navi-column-config-base__filter-icon--active').exists({ count: 2 }, 'Both filter icons are active');

    await selectChoose(findAll('.navi-column-config-item__parameter-trigger')[1], 'Dollars (CAD)');

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (USD)', 'Platform Revenue (CAD)'],
      'The second metric was updated'
    );

    assert
      .dom('.navi-column-config-base__filter-icon--active')
      .exists({ count: 1 }, 'Only one filter icon is active after changing second metric');

    await click(findAll('.navi-column-config-base__filter-icon')[1]);

    assert
      .dom('.navi-column-config-base__filter-icon--active')
      .exists({ count: 2 }, 'Both filter icons are active after adding second parameterized metric filter');

    assert.deepEqual(
      findAll('.filter-builder__subject').map(el => el.textContent.trim()),
      ['Date Time (Day)', 'Platform Revenue (CAD)', 'Platform Revenue (USD)'],
      'Second metric filter is added'
    );
  });

  test('config - filters - metrics - stay collapsed on remove', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

  test('config - filters - parameterized metrics - stay collapsed on remove', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

  test('config - filters - dimensions - stay collapsed on remove', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');
    await click('.navi-report__run-btn');

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

  test('config - parameterized metric - search parameters', async function(assert) {
    assert.expect(4);
    await visit('/reports/new');

    await clickItem('metric', 'Platform Revenue');

    await animationsSettled();
    assert.deepEqual(getColumns(), ['Date Time (Day)', 'Platform Revenue (USD)'], 'The initial metrics was added');

    await click('.navi-column-config-item__parameter-trigger');
    assert.strictEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()).length,
      14,
      'All options are shown initially'
    );
    await fillIn('.ember-power-select-search-input', 'Dollars');
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent.trim()),
      ['Dollars (AUD)', 'Dollars (CAD)', 'Dollars (USD)'],
      'After searching only the filtered metric is shown'
    );
    await click(findAll('.ember-power-select-option')[1]);

    assert.deepEqual(
      getColumns(),
      ['Date Time (Day)', 'Platform Revenue (CAD)'],
      'Clicking the filtered option changes the metrics parameter'
    );
  });

  function getColumns() {
    return findAll('.navi-column-config-item__name').map(el => el.textContent.trim());
  }
});
