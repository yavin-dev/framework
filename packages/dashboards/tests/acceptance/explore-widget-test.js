import { find, click, fillIn, currentURL, currentRouteName, findAll, blur, visit, waitFor } from '@ember/test-helpers';
import { module, test } from 'qunit';
import config from 'ember-get-config';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { Response } from 'ember-cli-mirage';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import $ from 'jquery';

// Regex to check that a string ends with "{uuid}/view"
const TempIdRegex = /\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

module('Acceptance | Exploring Widgets', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Widget title', async function(assert) {
    assert.expect(1);

    await visit('/dashboards/1/widgets/1');

    assert.dom('.navi-report-widget__title').hasText('Mobile DAU Goal', 'Widget title is displayed as the page title');
  });

  test('Editing widget title', async function(assert) {
    assert.expect(1);

    // Edit title
    await visit('/dashboards/1/widgets/2/view');
    await click('.editable-label__icon');
    await fillIn('.editable-label__input', 'A new title');
    await blur('.editable-label__input');

    // Save and return to dashboard
    await click('.navi-report-widget__save-btn');
    await visit('/dashboards/1');

    const widgetNames = findAll('.navi-widget__title').map(el => el.textContent.trim());

    assert.ok(widgetNames.includes('A new title'), 'New widget title is saved and persisted on dashboard');
  });

  test('Breadcrumb', async function(assert) {
    assert.expect(4);
    let originalFeatureFlag = config.navi.FEATURES.enableDirectory;

    config.navi.FEATURES.enableDirectory = true;

    await visit('/dashboards/1/widgets/1');

    assert.dom('.navi-report-widget__breadcrumb-link').hasText('Directory', 'Breadcrumb begins with "Directory" link');

    assert
      .dom('.navi-report-widget__breadcrumb-link')
      .hasAttribute('href', '/directory/my-data', 'First breadcrumb item links to my-data route');

    assert
      .dom(findAll('.navi-report-widget__breadcrumb-link')[1])
      .hasText('Tumblr Goals Dashboard', 'Breadcrumb begins with "Directory" link');

    assert
      .dom(findAll('.navi-report-widget__breadcrumb-link')[1])
      .hasAttribute('href', /\/dashboards\/1$/, 'Second breadcrumb item links to parent dashboard');

    config.navi.FEATURES.enableDirectory = originalFeatureFlag;
  });

  test('Viewing a widget', async function(assert) {
    assert.expect(2);

    await visit('/dashboards/1/widgets/2/view');

    assert.dom('.navi-report-widget__body .report-builder').isVisible('Widget body has a builder on the view route');

    assert
      .dom('.navi-report-widget__body .report-builder__container--result')
      .isVisible('Widget body has a visualization on the view route');
  });

  test('Exploring a widget', async function(assert) {
    assert.expect(1);

    await visit('/dashboards/1');
    await click(findAll('.navi-widget__explore-btn')[1]);

    assert.ok(currentURL().endsWith('/dashboards/1/widgets/2/view'), 'Explore action links to widget view route');
  });

  test('Changing and saving a widget', async function(assert) {
    assert.expect(4);

    // Add a metric to widget 2, save, and return to dashboard route
    await visit('/dashboards/1/widgets/2/view');

    assert.dom('.report-view__info-text').isNotVisible('Notification to run is not visible before making changes');

    await click($('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) .grouped-list__add-icon')[0]);

    assert.dom('.report-view__info-text').isVisible('Notification to run is visible after making changes');

    await click('.navi-report-widget__save-btn');

    assert
      .dom('.report-view__info-text')
      .isNotVisible('Notification to run is no longer visible after saving the report');

    await visit('/dashboards/1');

    const legends = findAll('.line-chart-widget .c3-legend-item').map(el => el.textContent.trim());

    assert.deepEqual(
      legends,
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Added metric appears in dashboard view after saving widget'
    );
  });

  test('Revert changes', async function(assert) {
    assert.expect(4);

    await visit('/dashboards/1/widgets/2/view');

    assert.dom('.navi-report-widget__revert-btn').isNotVisible('Revert changes button is not initially visible');

    // Remove a metric
    await click($('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label')[0]);
    assert
      .dom('.navi-report-widget__revert-btn')
      .isVisible('Revert changes button is visible once a change has been made');

    await click('.navi-report-widget__revert-btn');

    assert
      .dom('.filter-builder__subject')
      .hasText('Date Time (Day)', 'After clicking "Revert Changes", the changed time grain is returned');

    assert
      .dom('.navi-report-widget__revert-btn')
      .isNotVisible('After clicking "Revert Changes", button is once again hidden');
  });

  test('Export action', async function(assert) {
    assert.expect(3);

    let originalFeatureFlag = config.navi.FEATURES.enableMultipleExport;

    // Turn flag off
    config.navi.FEATURES.enableMultipleExport = false;

    await visit('/dashboards/1/widgets/2/view');

    assert
      .dom($('.navi-report-widget__action-link:contains(Export)')[0])
      .doesNotHaveClass(
        '.navi-report-widget__action-link--is-disabled',
        'Export action is enabled for a valid request'
      );

    assert
      .dom($('.navi-report-widget__action-link:contains(Export)')[0])
      .hasAttribute('href', /metrics=adClicks%2CnavClicks/, 'Have correct metric in export url');

    // Remove all metrics to create an invalid request
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__add-icon')[0]);
    await click(
      $('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__add-icon')[0]
    );

    assert
      .dom($('.navi-report-widget__action-link:contains(Export)')[0])
      .doesNotHaveClass(
        '.navi-report-widget__action-link--is-disabled',
        'Export action is disabled when request is not valid'
      );

    config.navi.FEATURES.enableMultipleExport = originalFeatureFlag;
  });

  test('Multi export action', async function(assert) {
    assert.expect(1);

    await visit('/dashboards/1/widgets/2/view');
    await clickTrigger('.multiple-format-export');
    assert
      .dom($('.multiple-format-export__dropdown a:contains(PDF)')[0])
      .hasAttribute('href', /export\?reportModel=/, 'Export url contains serialized report');
  });

  test('Get API action - enabled/disabled', async function(assert) {
    assert.expect(2);

    await visit('/dashboards/1/widgets/2/view');
    assert
      .dom('.get-api')
      .doesNotHaveClass('.navi-report-widget__action--is-disabled', 'Get API action is enabled for a valid request');

    // Remove all metrics
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__add-icon')[0]);
    await click(
      $('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__add-icon')[0]
    );

    // Remove all metrics to create an invalid request
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__add-icon')[0]);
    await click(
      $('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__add-icon')[0]
    );

    // Create empty filter to make request invalid
    await click($('.grouped-list__item:Contains(Operating System) .grouped-list__filter')[0]);

    assert
      .dom('.get-api')
      .hasClass('navi-report-widget__action--is-disabled', 'Get API action is disabled when request is not valid');
  });

  test('Share action', async function(assert) {
    assert.expect(2);

    /* == Unsaved widget == */
    await visit('/dashboards/1/widgets/new');
    await click($('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__add-icon')[0]);
    await click('.navi-report-widget__run-btn');

    assert.notOk(
      !!$('.navi-report-widget__action:contains(Share)').length,
      'Share action is not present on an unsaved report'
    );

    /* == Saved widget == */
    await visit('/dashboards/1/widgets/2/view');
    await click($('.navi-report-widget__action:contains(Share) button')[0]);

    assert
      .dom('.navi-modal .primary-header')
      .hasText('Share "Mobile DAU Graph"', 'Clicking share action brings up share modal');
  });

  test('Delete widget', async function(assert) {
    assert.expect(5);

    /* == Not author == */
    await visit('/dashboards/3/widgets/4/view');
    assert.notOk(
      !!$('.navi-report-widget__action:contains(Delete)').length,
      'Delete action is not available if user is not the author'
    );

    /* == Delete success == */
    await visit('/dashboards/1');

    assert.deepEqual(
      findAll('.navi-widget__title').map(el => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Graph', 'Mobile DAU Table'],
      '"DAU Graph" widget is initially present on dashboard'
    );

    await visit('/dashboards/1/widgets/2/view');
    await click($('.navi-report-widget__action:contains(Delete) button')[0]);
    assert.dom('.primary-header').hasText('Delete "Mobile DAU Graph"', 'Delete modal pops up when action is clicked');

    await click('.navi-modal .btn-primary');
    assert.ok(currentURL().endsWith('/dashboards/1/view'), 'After deleting, user is brought to dashboard view');

    assert.deepEqual(
      findAll('.navi-widget__title').map(el => el.textContent.trim()),
      ['Mobile DAU Goal', 'Mobile DAU Table'],
      'Deleted widget is removed from dashboard'
    );
  });

  test('Clone a widget', async function(assert) {
    assert.expect(4);
    let originalWidgetTitle;

    await visit('/dashboards/1/widgets/1/view');
    originalWidgetTitle = find('.navi-report-widget__title').textContent.trim();

    await click($('.navi-report-widget__action-link:contains("Clone As Report")')[0]);

    assert.ok(
      TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id'
    );

    assert.dom('.navi-report__title').hasText('Copy of ' + originalWidgetTitle, 'Cloned Report title is displayed');

    assert.dom('.navi-report__body .report-builder').isVisible('Report body has a builder on the view route');

    assert
      .dom('.navi-report__body .report-view__visualization-main')
      .isVisible('Report body has a visualization on the view route');
  });

  test('Error data request', async function(assert) {
    assert.expect(1);

    server.get(`${config.navi.dataSources[0].uri}/v1/data/*path`, () => {
      return new Response(500, {}, { description: 'Cannot merge mismatched time grains month and day' });
    });

    await visit('/dashboards/2/widgets/4/view');
    assert
      .dom('.navi-report-error__info-message')
      .hasText(
        'Oops! There was an error with your request. Cannot merge mismatched time grains month and day',
        'An error message is displayed for an invalid request'
      );
  });

  test('Cancel Widget', async function(assert) {
    //Slow down mock
    server.timing = 400;
    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('data/*path', () => {
      return { rows: [] };
    });

    //Load the widget
    visit('/dashboards/1/widgets/1/view').catch(error => {
      //https://github.com/emberjs/ember-test-helpers/issues/332
      const { message } = error;
      if (message !== 'TransitionAborted') {
        throw error;
      }
    });

    await waitFor('.navi-report-widget__cancel-btn', { timeout: 2000 });

    assert.equal(currentRouteName(), 'dashboards.dashboard.widgets.widget.loading', 'Widget is loading');

    assert.deepEqual(
      findAll('.navi-report-widget__footer .btn').map(e => e.textContent.trim()),
      ['Cancel'],
      'When widget is loading, the only footer button is `Cancel`'
    );

    await click('.navi-report-widget__cancel-btn');

    assert.equal(
      currentRouteName(),
      'dashboards.dashboard.widgets.widget.edit',
      'Clicking `Cancel` brings the user to the edit route'
    );

    assert.deepEqual(
      findAll('.navi-report-widget__footer .btn').map(e => e.textContent.trim()),
      ['Run', 'Save Changes', 'Revert Changes'],
      'When not loading a widget, the standard footer buttons are available'
    );

    //Run the widget
    await click('.navi-report-widget__run-btn');

    assert.equal(
      currentRouteName(),
      'dashboards.dashboard.widgets.widget.view',
      'Running the widget brings the user to the view route'
    );

    assert.deepEqual(
      findAll('.navi-report-widget__footer .btn').map(e => e.textContent.trim()),
      ['Run', 'Save Changes', 'Revert Changes'],
      'When not loading a widget, the standard footer buttons are available'
    );
  });
});
