import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Ember from 'ember';
import config from 'ember-get-config';
import Mirage from 'ember-cli-mirage';

let Application;

// Regex to check that a string ends with "{uuid}/view"
const TempIdRegex = /\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

module('Acceptance | Exploring Widgets', {
  beforeEach: function() {
    Application = startApp();
    wait();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(Application, 'destroy');
  }
});

test('Widget title', function(assert) {
  assert.expect(1);

  visit('/dashboards/1/widgets/1');

  andThen(function() {
    assert.equal(find('.navi-report-widget__title').text().trim(),
      'Mobile DAU Goal',
      'Widget title is displayed as the page title');
  });
});

test('Editing widget title', function(assert) {
  assert.expect(1);

  // Edit title
  visit('/dashboards/1/widgets/2/view');
  click('.editable-label__icon');
  fillIn('.editable-label__input', 'A new title');
  triggerEvent('.editable-label__input', 'blur');

  // Save and return to dashboard
  click('.navi-report-widget__save-btn');
  visit('/dashboards/1');

  andThen(function() {
    let widgetNames = $('.navi-widget__title').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.ok(Ember.A(widgetNames).includes('A new title'),
      'New widget title is saved and persisted on dashboard');
  });
});

test('Breadcrumb', function(assert) {
  assert.expect(4);

  visit('/dashboards/1/widgets/1');

  andThen(function() {
    let firstBreadcrumbItem = find('.navi-report-widget__breadcrumb-link:eq(0)'),
        secondBreadcrumbItem = find('.navi-report-widget__breadcrumb-link:eq(1)');

    assert.equal(firstBreadcrumbItem.text().trim(),
      'Directory',
      'Breadcrumb begins with "Directory" link');

    assert.ok(firstBreadcrumbItem.attr('href').endsWith('/directory/my-directory'),
      'First breadcrumb item links to my-directory route');

    assert.equal(secondBreadcrumbItem.text().trim(),
      'Tumblr Goals Dashboard',
      'Second breadcrumb contains dashboard title');

    assert.ok(secondBreadcrumbItem.attr('href').endsWith('/dashboards/1'),
      'Second breadcrumb item links to parent dashboard');
  });
});

test('Viewing a widget', function(assert) {
  assert.expect(2);

  visit('/dashboards/1/widgets/2/view');

  andThen(function() {
    assert.ok(find('.navi-report-widget__body .report-builder').is(':visible'),
      'Widget body has a builder on the view route');

    assert.ok(find('.navi-report-widget__body .report-builder__container--result').is(':visible'),
      'Widget body has a visualization on the view route');
  });
});

test('Exploring a widget', function(assert) {
  assert.expect(1);

  visit('/dashboards/1');
  click('.navi-widget__explore-btn:eq(1)');

  andThen(function() {
    assert.ok(currentURL().endsWith('/dashboards/1/widgets/2/view'),
      'Explore action links to widget view route');
  });
});

test('Changing and saving a widget', function(assert) {
  assert.expect(1);

  // Add a metric to widget 2, save, and return to dashboard route
  visit('/dashboards/1/widgets/2/view');
  click('.checkbox-selector--metric .grouped-list__item:contains(Total Clicks) label');
  click('.navi-report-widget__save-btn');
  visit('/dashboards/1');

  andThen(() => {
    let legends = $('.c3-legend-item').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.deepEqual(legends,
      [
        'Ad Clicks',
        'Nav Link Clicks',
        'Total Clicks'
      ],
      'Added metric appears in dashboard view after saving widget');
  });
});

test('Revert changes', function(assert) {
  assert.expect(4);

  visit('/dashboards/1/widgets/2/view');

  andThen(() => {
    assert.notOk($('.navi-report-widget__revert-btn').is(':visible'),
      'Revert changes button is not initially visible');
  });

  // Remove a metric
  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) label');
  andThen(() => {
    assert.ok($('.navi-report-widget__revert-btn').is(':visible'),
      'Revert changes button is visible once a change has been made');
  });

  click('.navi-report-widget__revert-btn');
  andThen(() => {
    assert.ok($('.filter-builder__subject:contains(Day)').is(':visible'),
      'After clicking "Revert Changes", the changed time grain is returned');

    assert.notOk($('.navi-report-widget__revert-btn').is(':visible'),
      'After clicking "Revert Changes", button is once again hidden');
  });
});

test('Export action', function(assert) {
  assert.expect(3);

  let originalFeatureFlag = config.navi.FEATURES.enableMultipleExport;

  // Turn flag off
  config.navi.FEATURES.enableMultipleExport = false;

  visit('/dashboards/1/widgets/2/view');

  andThen(() => {
    assert.notOk($('.navi-report-widget__action-link:contains(Export)').is('.navi-report-widget__action-link--is-disabled'),
      'Export action is enabled for a valid request');
    assert.ok(find('.navi-report-widget__action-link:contains(Export)').attr('href').includes('metrics=adClicks%2CnavClicks'),
      'Have correct metric in export url');
  });

  // Remove all metrics to create an invalid request
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) label');

  andThen(() => {
    assert.ok($('.navi-report-widget__action-link:contains(Export)').is('.navi-report-widget__action-link--is-disabled'),
      'Export action is disabled when request is not valid');

    config.navi.FEATURES.enableMultipleExport = originalFeatureFlag;
  });
});

test('Multi export action', function (assert) {
  assert.expect(1);

  visit('/dashboards/1/widgets/2/view');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    assert.ok(find('.multiple-format-export__dropdown a:contains(PDF)').attr('href').includes('export?reportModel='),
      'Export url contains serialized report');
  });
});

test('Get API action - enabled/disabled', function(assert) {
  assert.expect(2);

  visit('/dashboards/1/widgets/2/view');
  andThen(() => {
    assert.notOk($('.get-api').is('.navi-report-widget__action--is-disabled'),
      'Get API action is enabled for a valid request');
  });

  // Remove all metrics to create an invalid request
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) label');
  andThen(() => {
    assert.ok($('.get-api').is('.navi-report-widget__action--is-disabled'),
      'Get API action is disabled when request is not valid');
  });
});

test('Share action', function(assert) {
  assert.expect(2);

  /* == Unsaved widget == */
  visit('/dashboards/1/widgets/new');
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) label');
  click('.navi-report-widget__run-btn');
  andThen(() => {
    assert.notOk($('.navi-report-widget__action:contains(Share)').is(':visible'),
      'Share action is not present on an unsaved report');
  });

  /* == Saved widget == */
  visit('/dashboards/1/widgets/2/view');
  click('.navi-report-widget__action:contains(Share) button');

  andThen(() => {
    assert.equal($('.navi-modal .primary-header').text(),
      'Share "Mobile DAU Graph"',
      'Clicking share action brings up share modal');
  });
});

test('Delete widget', function(assert) {
  assert.expect(5);

  /* == Not author == */
  visit('/dashboards/3/widgets/4/view');
  andThen(() => {
    assert.notOk($('.navi-report-widget__action:contains(Delete)').is(':visible'),
      'Delete action is not available if user is not the author');
  });

  /* == Delete success == */
  visit('/dashboards/1');
  andThen(() => {
    let widgetNames = $('.navi-widget__title').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.deepEqual(widgetNames,
      [
        'Mobile DAU Goal',
        'Mobile DAU Graph',
        'Mobile DAU Table'
      ],
      '"DAU Graph" widget is initially present on dashboard');
  });

  visit('/dashboards/1/widgets/2/view');
  click('.navi-report-widget__action:contains(Delete) button');
  andThen(() => {
    assert.equal(find('.primary-header').text().trim(),
      'Delete "Mobile DAU Graph"',
      'Delete modal pops up when action is clicked');
  });

  click('.navi-modal .btn-primary');
  andThen(() => {
    assert.ok(currentURL().endsWith('/dashboards/1/view'),
      'After deleting, user is brought to dashboard view');

    let widgetNames = $('.navi-widget__title').map(function() {
      return this.textContent.trim();
    }).toArray();

    assert.deepEqual(widgetNames,
      [
        'Mobile DAU Goal',
        'Mobile DAU Table'
      ],
      'Deleted widget is removed from dashboard');
  });
});

test('Clone a widget', function(assert) {
  assert.expect(4);
  let originalWidgetTitle;

  visit('/dashboards/1/widgets/1/view');
  andThen(() => {
    originalWidgetTitle = find('.navi-report-widget__title').text().trim();
  });

  click('.navi-report-widget__action-link:contains("Clone As Report")');

  andThen(() => {
    assert.ok(TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id');

    assert.equal(find('.navi-report__title').text().trim(),
      'Copy of ' + originalWidgetTitle,
      'Cloned Report title is displayed');

    assert.ok(find('.navi-report__body .report-builder').is(':visible'),
      'Report body has a builder on the view route');

    assert.ok(find('.navi-report__body .report-view__visualization-main').is(':visible'),
      'Report body has a visualization on the view route');
  });
});

test('Error data request', function (assert) {
  assert.expect(1);

  server.get(`${config.navi.dataSources[0].uri}/v1/data/*path`, () => {
    return new Mirage.Response(
      500,
      {},
      { description: 'Cannot merge mismatched time grains month and day' }
    );
  });

  //suppress errors and exceptions for this test
  let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = function () { };
  Ember.Test.adapter.exception = function () { };

  visit('/dashboards/2/widgets/4/view');
  andThen(() => {
    assert.equal($('.navi-report-error__info-message').text().replace(/\s+/g, " ").trim(),
      'Oops! There was an error with your request. Cannot merge mismatched time grains month and day',
      'An error message is displayed for an invalid request');

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});
