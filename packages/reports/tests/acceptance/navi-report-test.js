import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import { teardownModal } from '../helpers/teardown-modal';
import config from 'ember-get-config';
import Mirage from 'ember-cli-mirage';

const { get } = Ember;

let Application;

// Regex to check that a string ends with "{uuid}/view"
const TempIdRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

// Regex to check that a string ends with "{integer}/view"
const PersistedIdRegex = /\/\d+\/view$/;

let CompressionService;

module('Acceptances | Navi Report', {
  beforeEach() {
    Application = startApp();

    CompressionService = Application.__container__.lookup('service:model-compression');
    // Mocking add-to-dashboard component
    Application.register(
      'component:report-actions/add-to-dashboard',
      Ember.Component.extend({ classNames: 'add-to-dashboard' }),
      { instantiate: false }
    );

    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  },
  afterEach() {
    teardownModal();
    server.shutdown();
    Ember.run(Application, 'destroy');

    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  }
});

test('validation errors', function(assert) {
  assert.expect(3);

  // Make an invalid change and run report
  visit('/reports/1');
  click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');
  click('.navi-report__run-btn');

  andThen(function() {
    assert.equal(currentURL(), '/reports/1/invalid', 'User is transitioned to invalid route');

    let errors = find('.navi-info-message__error-list-item')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );
    assert.deepEqual(errors, ['Operating System filter needs at least one value'], 'Form errors are displayed to user');
  });

  // Fix the errors and run report
  click('.filter-collection__remove:eq(1)');
  click('.navi-report__run-btn');

  andThen(function() {
    assert.equal(currentURL(), '/reports/1/view', 'Fixing errors and clicking "Run" returns user to view route');
  });
});

test('Clone report', function(assert) {
  assert.expect(2);

  visit('/reports/1/clone');

  andThen(() => {
    assert.ok($('.report-view').is(':visible'), 'The route transistions to report view');

    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      'Copy of Hyrule News',
      'Cloned report is being viewed'
    );
  });
});

test('Clone invalid report', function(assert) {
  assert.expect(1);

  visit('/reports/1');
  // Add a metric filter
  click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');
  click('.navi-report__action-link:contains(Clone)');

  andThen(() => {
    assert.ok(currentURL().endsWith('edit'), 'An invalid new report transitions to the reports/:id/edit route');
  });
});

test('New report', function(assert) {
  assert.expect(4);

  visit('/reports/new');

  /* == Run with errors == */
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      currentURL().endsWith('/invalid'),
      'After clicking the run button, the route transitions to the invalid route'
    );
  });

  /* == Fix errors == */
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(currentURL().endsWith('/view'), 'Running a report with no errors transitions to view route');

    assert.ok(!!find('.table-widget').length, 'Data table visualization is shown by default');

    assert.ok(
      !!find('.table-header-row-vc--view .table-header-cell:contains(Ad Clicks)').length,
      'Ad Clicks column is displayed'
    );
  });
});

test('New report - copy api', function(assert) {
  assert.expect(2);

  visit('/reports/new');
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.ok(find('.get-api-modal-container').is(':visible'), 'Copy modal is open after fixing error clicking button');
  });

  /* == Add some more metrics and check that copy modal updates == */
  click('.navi-modal__close');
  click('.checkbox-selector--metric .grouped-list__item:contains(Additive Page Views) .grouped-list__item-label');
  click('.navi-report__copy-api-btn .get-api__btn');
  andThen(() => {
    assert.ok(
      find('.navi-modal__input')
        .val()
        .includes('metrics=adClicks%2CaddPageViews'),
      'API query updates with request'
    );
  });
});

test('Revert changes when exiting report - existing report', function(assert) {
  assert.expect(5);

  // visit report 1
  visit('/reports/1/view');
  andThen(() => {
    assert.ok(
      $('.checkbox-selector--dimension .grouped-list__item:contains(Day) .grouped-list__item-label input').is(
        ':checked'
      ),
      'Day timegrain is checked by default'
    );
  });

  // uncheck the day timegrain
  click('.checkbox-selector--dimension .grouped-list__item:contains(Day) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.checkbox-selector--dimension .grouped-list__item:contains(Day) .grouped-list__item-label input').is(
        ':checked'
      ),
      'Day timegrain is unchecked after clicking on it'
    );
    assert.ok(
      $('.navi-report__revert-btn').is(':visible'),
      'Revert changes button is visible once a change has been made'
    );
  });

  // leave the route
  visit('/reports');

  // enter the route again
  click("a[href$='/reports/1/view']");
  andThen(() => {
    assert.notOk(
      $('.navi-report__revert-btn').is(':visible'),
      'After navigating away and back to the route, the Revert button disappears'
    );
    assert.ok(
      $('.checkbox-selector--dimension .grouped-list__item:contains(Day) .grouped-list__item-label input').is(
        ':checked'
      ),
      'After navigating away and back to the route, changes are reverted'
    );
  });
});

test('Revert changes - existing report', function(assert) {
  assert.expect(4);

  visit('/reports/1/view');
  andThen(() => {
    assert.ok(
      $('.filter-builder__subject:contains(Day)').is(':visible'),
      'After navigating to a route, the Timegrain "Day" option is visible'
    );
  });

  // Remove a metric
  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      $('.navi-report__revert-btn').is(':visible'),
      'Revert changes button is visible once a change has been made'
    );
  });

  click('.navi-report__revert-btn');
  andThen(() => {
    assert.ok(
      $('.filter-builder__subject:contains(Day)').is(':visible'),
      'After navigating out of the route, the report model is rolled back'
    );

    assert.notOk(
      $('.navi-report__revert-btn').is(':visible'),
      'After clicking "Revert Changes", button is once again hidden'
    );
  });
});

test('Revert changes - new report', function(assert) {
  assert.expect(2);

  visit('/reports/new');
  andThen(() => {
    assert.notOk($('.navi-report__revert-btn').is(':visible'), 'Revert changes button is not initially visible');

    click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
    andThen(() => {
      assert.notOk(
        $('.navi-report__revert-btn').is(':visible'),
        'Revert changes button is not visible on a new report even after making a change'
      );
    });
  });
});

test('Revert and Save report', function(assert) {
  assert.expect(2);

  visit('/reports');
  visit('/reports/new');
  let container = Application.__container__;

  //Add three metrics and save the report
  click('.checkbox-selector--metric .grouped-list__item:contains(Page Views) .grouped-list__item-label');
  click('.navi-report__save-btn');

  //remove a metric and save the report
  click('.checkbox-selector--metric .grouped-list__item:contains(Total Page Views) .grouped-list__item-label');
  click('.navi-report__save-btn');

  //remove another metric and run the report
  click('.checkbox-selector--metric .grouped-list__item:contains(Additive Page Views) .grouped-list__item-label');
  click('.navi-report__run-btn');

  //revert changes
  click('.navi-report__revert-btn');

  andThen(() => {
    let emberId = find('.report-view.ember-view').attr('id'),
      component = container.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after running then reverting.'
    );
  });

  //run after reverting
  click('.navi-report__run-btn');

  andThen(() => {
    assert.notOk(
      find('.navi-info-message.navi-report-error__info-message.ember-view').attr('id'),
      'Error message is not displayed when reverting and running'
    );
  });
});

test('Cancel Save As report', function(assert) {
  assert.expect(6);

  visit('/reports');
  visit('/reports/new');
  let container = Application.__container__;

  //Add a metrics and save the report
  click('.checkbox-selector--metric .grouped-list__item:contains(Additive Page Views) .grouped-list__item-label');
  click('.navi-report__save-btn');

  // Change the Dim
  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label');

  // And click Save AS the report
  click('.navi-report__save-as-btn');

  // The Modal with buttons is Visible
  andThen(() => {
    assert.ok(find('.save-as__cancel-modal-btn').is(':visible'), 'Save As Modal is visible with cancel key');
  });

  // Press the Modal X button
  click('.navi-modal__close');

  andThen(() => {
    // Changes were not reverted, but they were not saved
    assert.ok(
      $('.filter-builder__subject:contains(Week)').is(':visible'),
      'On cancel the dirty state of the report still remains.'
    );

    let emberId = find('.report-view.ember-view').attr('id'),
      component = container.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after closing Save-As Modal.'
    );
  });

  // And click Save AS the report
  click('.navi-report__save-as-btn');

  // The Modal with buttons is Visible
  andThen(() => {
    assert.ok(find('.save-as__cancel-modal-btn').is(':visible'), 'Save As Modal is visible with cancel key');
  });

  // Press the Modal cancel button
  click('.save-as__cancel-modal-btn');

  andThen(() => {
    // Changes were not reverted, but they were not saved
    assert.ok(
      $('.filter-builder__subject:contains(Week)').is(':visible'),
      'On cancel the dirty state of the report still remains.'
    );

    let emberId = find('.report-view.ember-view').attr('id'),
      component = container.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after canceling Save-As.'
    );
  });
});

test('Save As report', function(assert) {
  assert.expect(7);

  visit('/reports/1');
  let container = Application.__container__;

  const saveAsVisible = () => {
    let el = find('.save-as__save-as-modal-btn');
    if (el instanceof $) {
      //use this to normalize, we can remove this once jquery is gone.
      el = el[0];
    }
    return Boolean(el && el.offsetParent);
  };

  // Change the Dim
  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label');

  // And click Save AS the report
  click('.navi-report__save-as-btn');

  // The Modal with buttons is Visible
  andThen(() => {
    assert.ok(saveAsVisible(), 'Save As Modal is visible with save as key');
  });

  // Press the save as
  click('.save-as__save-as-modal-btn');

  andThen(() => {
    assert.ok($('.filter-builder__subject:contains(Week)').is(':visible'), 'The new Dim is shown in the new report.');

    // New Report is run
    let emberId = find('.report-view.ember-view').attr('id'),
      component = container.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after running then reverting.'
    );

    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      '(New Copy) Hyrule News',
      'New Saved Report is being viewed'
    );

    assert.notOk(saveAsVisible(), 'Save As Modal not visible after save');
  });

  visit('/reports/1');

  andThen(() => {
    assert.ok($('.filter-builder__subject:contains(Day)').is(':visible'), 'Old unsaved report have the old DIM.');

    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      'Hyrule News',
      'Old Report with unchanged title is being viewed.'
    );
  });
});

test('Save As on failure', function(assert) {
  assert.expect(3);

  server.urlPrefix = `${config.navi.appPersistence.uri}`;
  server.post('/reports', () => {
    return new Mirage.Response(500);
  });

  visit('/reports/1');

  // Change the Dim
  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label');

  // And click Save AS the report
  click('.navi-report__save-as-btn');

  // Press the save as
  click('.save-as__save-as-modal-btn');

  // An error will occur and it will go back to old report dirty state
  andThen(() => {
    // Check URL
    assert.equal(currentURL(), '/reports/1/view', 'The url shows report 1');

    // Old Report
    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      'Hyrule News',
      'Old Report with unchanged title is being viewed.'
    );

    // Dirty state of old
    assert.ok($('.filter-builder__subject:contains(Week)').is(':visible'), 'Old unsaved report have the old DIM.');
  });
});

test('Save report', function(assert) {
  assert.expect(4);

  visit('/reports');
  visit('/reports/new');
  andThen(() => {
    assert.ok($('.navi-report__save-btn').is(':visible'), 'Save button is visible in the new route');
  });

  // Build a report
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(TempIdRegex.test(currentURL()), 'Creating a report brings user to /view route with a temp id');
  });

  click('.navi-report__save-btn');
  andThen(() => {
    assert.ok(PersistedIdRegex.test(currentURL()), 'After saving, user is brought to /view route with persisted id');

    assert.notOk(
      $('.navi-report__save-btn').is(':visible'),
      'Save button is not visible when report is saved and has no changes'
    );
  });
});

test('Clone action', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  click('.navi-report__action-link:contains(Clone)');

  andThen(() => {
    assert.ok(
      TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id'
    );

    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      'Copy of Hyrule News',
      'Cloned report is being viewed'
    );
  });
});

test('Clone action - enabled/disabled', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action-link:contains(Clone)').is('.navi-report__action-link--force-disabled'),
      'Clone action is enabled for a valid report'
    );
  });

  // Remove all metrics to create , but do not save
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action-link:contains(Clone)').is('.navi-report__action-link--force-disabled'),
      'Clone action is enabled from a valid save report'
    );
  });
});

test('Export action - enabled/disabled', function(assert) {
  assert.expect(4);

  visit('/reports/1/view');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action-link:contains(Export)').is('.navi-report__action-link--force-disabled'),
      'Export action is enabled for a valid report'
    );
  });

  // Add new dimension to make it out of sync with the visualization
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      $('.navi-report__action-link:contains(Export)').is('.navi-report__action-link--force-disabled'),
      'Export action is disabled when report is not valid'
    );
  });

  // Remove new dimension to make it in sync with the visualization
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action-link:contains(Export)').is('.navi-report__action-link--force-disabled'),
      'Export action is enabled for a valid report'
    );
  });

  // Remove all metrics to create an invalid report
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      $('.navi-report__action-link:contains(Export)').is('.navi-report__action-link--force-disabled'),
      'Export action is disabled when report is not valid'
    );
  });
});

test('Export action - href', function(assert) {
  assert.expect(4);

  let originalFeatureFlag = config.navi.FEATURES.enableMultipleExport;

  // Turn flag off
  config.navi.FEATURES.enableMultipleExport = false;

  visit('/reports/1/view');
  andThen(() => {
    assert.ok(
      find('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('/network/day/property/?dateTime='),
      'Export url contains dimension path param'
    );
  });

  /* == Add groupby == */
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('/network/day/property/productFamily/?dateTime='),
      'Groupby changes are automatically included in export url'
    );

    assert.notOk(
      find('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('filter'),
      'No filters are initially present in export url'
    );
  });

  /* == Add filter == */
  click('.navi-report__run-btn');
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .checkbox-selector__filter');

  /* == Update filter value == */
  selectChoose('.filter-values--dimension-select', '(1)');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('productFamily%7Cid-in%5B1%5D'),
      'Filter updates are automatically included in export url'
    );

    config.navi.FEATURES.enableMultipleExport = originalFeatureFlag;
  });
});

test('Multi export action - csv href', function(assert) {
  assert.expect(4);

  visit('/reports/1/view');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    assert.ok(
      find('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('/network/day/property/?dateTime='),
      'Export url contains dimension path param'
    );
  });

  /* == Add groupby == */
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .grouped-list__item-label');
  click('.navi-report__run-btn');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    assert.ok(
      find('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('/network/day/property/productFamily/?dateTime='),
      'Groupby changes are automatically included in export url'
    );

    assert.notOk(
      find('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('filter'),
      'No filters are initially present in export url'
    );
  });

  /* == Add filter == */
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .checkbox-selector__filter');
  /* == Update filter value == */
  selectChoose('.filter-values--dimension-select', '(1)');
  click('.navi-report__run-btn');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    assert.ok(
      find('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('productFamily%7Cid-in%5B1%5D'),
      'Filter updates are automatically included in export url'
    );
  });
});

test('Multi export action - pdf href', function(assert) {
  assert.expect(4);

  const initialUrl =
    '/export?reportModel=EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgK0eYk8QYEkADCHAoA1nTAxmKq0DHaucgAvmXGPn4B_ADyRJDaSADaEGJEvBJqTsAAulW-VP56pS0o_EWSKcAACp3dogAEOHma7OTuBigdXdqiUlhYACwQFbgTU1Lzez1LAExBDBtbyO0L-72I2AAMfz-rc6XMzXD53ADMTxepR2YIOMyw_x-j2AFT6FQxlWEqFgbGm32AAAkRERyHilgA5KgAd1yxiIVAAjpsaOpthA2LwInF2AAVaCkPEeAVCmayWDU3hELJBWBDADiRGgqH0BJgvSxpkScTGKBiSSk0HSmRyZwuEH1cSkkwYGTiptRAwg1WGtV1zqGI0CM12iw1TuA4TY1B0rQDKiY_CiBhaAZoUrZiHGFu1yQJNrt2TpHoZCjl3oJ0BoyTKAZVIeebHdwFZqkTEHuAIArHIjnIfgBOJZ_RA9v4AOn-QWGGBmjawLbbWAAbN2fr35wOh47jKRVJAAGolPRSBirelMlmwLc6HczPdnTUMtg8AQ0JSoMQwgiUJRS6yWBDs4CefEQcguKGaxoKO6bQEwAD6AHNKi5zCOIf7AAyYgJrkFTAEAA';
  visit('/reports/1/view');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    assert.equal(
      find('.multiple-format-export__dropdown a:contains(PDF)').attr('href'),
      initialUrl,
      'Export url contains serialized report'
    );
  });

  /* == Add groupby == */
  click('.checkbox-selector--dimension .grouped-list__item:contains(Product Family) .grouped-list__item-label');
  click('.navi-report__run-btn');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    let modelStr = find('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];
    return CompressionService.decompress(modelStr).then(model => {
      assert.ok(
        get(model, 'request.dimensions')
          .objectAt(1)
          .get('dimension.name'),
        'productFamily',
        'Groupby changes are automatically included in export url'
      );
    });
  });

  /* == Change to table == */
  click('.visualization-toggle__option:contains(Data Table)');
  click('.navi-report__run-btn');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    let modelStr = find('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];
    return CompressionService.decompress(modelStr).then(model => {
      assert.equal(
        get(model, 'visualization.type'),
        'table',
        'Visualization type changes are automatically included in export url'
      );
    });
  });

  /* == Add grand total to table == */
  click('.report-view__visualization-edit-btn');
  click('.table-config__total-toggle-button--grand-total .x-toggle-btn');
  click('.navi-report__run-btn');
  clickDropdown('.multiple-format-export');
  andThen(() => {
    let modelStr = find('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];
    return CompressionService.decompress(modelStr).then(model => {
      assert.equal(
        get(model, 'visualization.metadata.showTotals.grandTotal'),
        true,
        'Visualization config changes are automatically included in export url'
      );
    });
  });
});

test('Get API action - enabled/disabled', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  andThen(() => {
    assert.notOk($('.get-api').is('.navi-report__action--is-disabled'), 'Get API action is enabled for a valid report');
  });

  // Remove all metrics to create an invalid report
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      $('.get-api').is('.navi-report__action--is-disabled'),
      'Get API action is disabled for an invalid report'
    );
  });
});

test('Share report', function(assert) {
  assert.expect(3);

  /* == Saved report == */
  visit('/reports/1/view');
  click('.navi-report__action:contains(Share) button');

  andThen(() => {
    assert.equal(
      $('.navi-modal .primary-header').text(),
      'Share "Hyrule News"',
      'Clicking share action brings up share modal'
    );
  });

  // Remove all metrics to create an invalid report
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action:contains(Share)').is('.navi-report__action--is-disabled'),
      'Share action is disabled for invalid report'
    );
  });

  // Share is disabled on new
  visit('/reports/new');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action:contains(Share)').is('.navi-report__action--is-disabled'),
      'Share action is disabled for new report'
    );
  });
});

test('Share report notifications reset', function(assert) {
  assert.expect(4);

  /* == Saved report == */
  visit('/reports/1/view');
  click('.navi-report__action:contains(Share) button');

  andThen(() => {
    assert.equal(
      $('.navi-modal .primary-header').text(),
      'Share "Hyrule News"',
      'Clicking share action brings up share modal'
    );

    assert.notOk($('.navi-modal .modal-notification').is(':visible'), 'Notification banner is not shown');
  });

  click('.navi-modal .copy-btn');

  andThen(() => {
    assert.ok($('.navi-modal .modal-notification').is(':visible'), 'Notification banner is shown');
  });

  click('.navi-modal .btn:contains(Cancel)');
  click('.navi-report__action:contains(Share) button');

  andThen(() => {
    assert.notOk(
      $('.navi-modal .modal-notification').is(':visible'),
      'Notification banner is not shown after close and reopen'
    );
  });
});

test('Delete report on success', function(assert) {
  assert.expect(5);

  /* == Delete success == */
  visit('/reports');
  andThen(() => {
    let reportNames = $('.table tbody td:first-child')
      .map(function() {
        return this.textContent.trim();
      })
      .toArray();

    assert.deepEqual(
      reportNames,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
      'Report 1 is initially listed in reports route'
    );
  });

  visit('/reports/1/view');
  click('.navi-report__action:contains(Delete) button');

  andThen(() => {
    assert.equal(
      find('.primary-header')
        .text()
        .trim(),
      'Delete "Hyrule News"',
      'Delete modal pops up when action is clicked'
    );
  });

  click('.navi-modal .btn-primary');

  andThen(() => {
    assert.ok(currentURL().endsWith('/reports'), 'After deleting, user is brought to report list view');

    let reportNames = $('.table tbody td:first-child')
      .map(function() {
        return this.textContent.trim();
      })
      .toArray();

    assert.deepEqual(reportNames, ['Hyrule Ad&Nav Clicks', 'Report 12'], 'Deleted report is removed from list');
  });

  // /* == Not author == */
  visit('/reports/3/view');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action:contains(Delete)').is(':visible'),
      'Delete action is not available if user is not the author'
    );
  });
});

test('Delete action - enabled at all times', function(assert) {
  assert.expect(4);

  // Delete is not Disabled on new
  visit('/reports/new');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action:contains(Delete)').is('.navi-report__action--is-disabled'),
      'Delete action is enabled for a valid report'
    );
  });

  // Delete is not Disabled on valid
  visit('/reports/1/view');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action:contains(Delete)').is('.navi-report__action--is-disabled'),
      'Delete action is enabled for a valid report'
    );
  });

  /*
   * Remove all metrics to create an invalid report
   * Delete is not Disabled on invalid
   */
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.navi-report__action-link:contains(Delete)').is('.navi-report__action--is-disabled'),
      'Delete action is enabled when report is not valid'
    );
  });

  // Check Delete modal appear
  click('.navi-report__action:contains(Delete) button');
  andThen(() => {
    assert.equal(
      find('.primary-header')
        .text()
        .trim(),
      'Delete "Hyrule News"',
      'Delete modal pops up when action is clicked'
    );
  });
});

test('Delete report on failure', function(assert) {
  assert.expect(1);

  server.urlPrefix = `${config.navi.appPersistence.uri}`;
  server.delete('/reports/:id', () => {
    return new Mirage.Response(500);
  });

  visit('/reports/2/view');
  click('.navi-report__action:contains(Delete) button');
  click('.navi-modal .btn-primary');

  andThen(() => {
    assert.ok(currentURL().endsWith('reports/2/view'), 'User stays on current view when delete fails');
  });
});

test('Add to dashboard button - flag false', function(assert) {
  assert.expect(1);

  let originalFeatures = config.navi.FEATURES;

  // Turn flag off
  config.navi.FEATURES = { dashboards: false };

  visit('/reports/1/view');
  andThen(() => {
    assert.notOk(
      find('.add-to-dashboard').is(':visible'),
      'Add to Dashboard button is not visible when feature flag is off'
    );

    config.navi.FEATURES = originalFeatures;
  });
});

test('Switch Visualization Type', function(assert) {
  assert.expect(7);

  visit('/reports/1/view');

  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'Line chart visualization is shown as configured');

    assert.equal(
      find('.report-view__visualization-edit-btn')
        .text()
        .trim(),
      'Edit Line Chart',
      'Edit Line Chart label is displayed'
    );

    assert.equal(find('.c3-legend-item').length, 3, 'Line chart visualization has 3 series as configured');
  });

  click('.visualization-toggle__option:contains(Data Table)');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is shown when selected');

    assert.equal(
      find('.report-view__visualization-edit-btn')
        .text()
        .trim(),
      'Edit Table',
      'Edit Data Table label is displayed'
    );
  });

  click('.visualization-toggle__option:contains(Line Chart)');
  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'line-chart visualization is shown when selected');

    assert.equal(
      find('.report-view__visualization-edit-btn')
        .text()
        .trim(),
      'Edit Line Chart',
      'Edit Line Chart label is displayed'
    );
  });
});

test('redirect from report/index route', function(assert) {
  assert.expect(2);

  visit('/reports/1');
  andThen(() => {
    assert.equal(
      currentURL(),
      '/reports/1/view',
      'The url of the index route is replaced with the url of the view route'
    );

    assert.ok(
      $('.navi-report__body .report-view').is(':visible'),
      'The report/index route redirects to the reports view route by default'
    );
  });
});

test('visiting Reports Route', function(assert) {
  assert.expect(1);

  visit('/reports');
  andThen(() => {
    let titles = find('.navi-collection .table tr td:first-of-type')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );
    assert.deepEqual(
      titles,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
      'the report list with `navi-users`s reports is shown'
    );
  });
});

test('reports route actions -- clone', function(assert) {
  assert.expect(2);

  visit('/reports');

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  // Click "Clone"
  click('.navi-collection__row:first-of-type .clone');
  andThen(() => {
    assert.ok(
      TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id'
    );

    assert.equal(
      $('.navi-report__title')
        .text()
        .trim(),
      'Copy of Hyrule News',
      'Cloned report is being viewed'
    );
  });
});

test('reports route actions -- share', function(assert) {
  assert.expect(1);

  visit('/reports');

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  // Click "Share"
  click('.navi-collection__row:first-of-type .share .btn');

  andThen(() => {
    assert.equal(
      find('.primary-header')
        .text()
        .trim(),
      'Share "Hyrule News"',
      'Share modal pops up when action is clicked'
    );

    // Click "Cancel"
    click('.navi-modal .btn-secondary');
  });
});

test('reports route actions -- delete', function(assert) {
  assert.expect(3);

  visit('/reports');

  // TriggerEvent does not work here, need to use jquery trigger mouseenter
  andThen(() => $('.navi-collection__row:first-of-type').trigger('mouseenter'));
  // Click "Delete"
  click('.navi-collection__row:first-of-type .delete button');

  andThen(() => {
    assert.equal(
      find('.primary-header')
        .text()
        .trim(),
      'Delete "Hyrule News"',
      'Delete modal pops up when action is clicked'
    );
  });

  //Click "Confirm"
  click('.navi-modal .btn-primary');

  andThen(() => {
    assert.ok(currentURL().endsWith('/reports'), 'After deleting, user is brought to report list view');

    let reportNames = $('.table tbody td:first-child')
      .map(function() {
        return this.textContent.trim();
      })
      .toArray();

    assert.deepEqual(reportNames, ['Hyrule Ad&Nav Clicks', 'Report 12'], 'Deleted report is removed from list');
  });
});

test('Visiting Reports Route From Breadcrumb', function(assert) {
  assert.expect(1);

  visit('/reports/1/view');

  //Click "Reports"
  click('.navi-report__breadcrumb-link');

  andThen(() => {
    assert.ok(
      currentURL().endsWith('/reports'),
      'When "Directory" clicked on the Breadcrumb link, it lands to "my-data" page'
    );
  });
});

test('Revert report changes when exiting from route', function(assert) {
  assert.expect(2);

  visit('/reports/4/view');
  andThen(() => {
    assert.ok(
      $('.filter-builder__subject:contains(Day)').is(':visible'),
      'After navigating out of the route, the report model is rolled back'
    );
  });

  click('.checkbox-selector--dimension .grouped-list__item:contains(Week) .grouped-list__item-label');

  //Navigate out of report
  click('.navi-report__breadcrumb-link');

  //Navigate back to `Report 12`
  visit('/reports/4/view');

  andThen(() => {
    assert.ok(
      $('.filter-builder__subject:contains(Day)').is(':visible'),
      'After navigating out of the route, the report model is rolled back'
    );
  });
});

test('Revert Visualization Type - Back to Original Type', function(assert) {
  assert.expect(3);

  /* == Load report == */
  visit('/reports/1/view');
  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'Line chart visualization is shown as configured');
  });

  /* == Switch to table == */
  click('.visualization-toggle__option:contains(Data Table)');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is shown when selected');
  });

  /* == Revert == */
  click('.navi-report__revert-btn');
  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'line-chart visualization is shown when reverted');
  });
});

test('Revert Visualization Type - Updated Report', function(assert) {
  assert.expect(5);

  /* == Load report == */
  visit('/reports/1/view');
  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'Line chart visualization is shown as configured');
  });

  /* == Switch to table == */
  click('.visualization-toggle__option:contains(Data Table)');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is shown when selected');
  });

  /* == Save report == */
  click('.navi-report__save-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is still shown when saved');
  });

  /* == Switch to chart == */
  click('.visualization-toggle__option:contains(Line Chart)');
  andThen(() => {
    assert.ok(!!find('.line-chart-widget').length, 'line-chart visualization is shown when selected');
  });

  /* == Revert == */
  click('.navi-report__revert-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is shown when reverted');
  });
});

test('Revert Visualization Type - New Report', function(assert) {
  assert.expect(4);

  /* == Create report == */
  visit('/reports');
  visit('/reports/new');
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'Table visualization is shown by default');
  });

  /* == Save report == */
  click('.navi-report__save-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'Table visualization is still shown when saved');
  });

  /* == Switch to metric label == */
  click('.visualization-toggle__option:contains(Metric Label)');
  andThen(() => {
    assert.ok(!!find('.metric-label-vis').length, 'Metric label visualization is shown when selected');
  });

  /* == Revert == */
  click('.navi-report__revert-btn');
  andThen(() => {
    assert.ok(!!find('.table-widget').length, 'table visualization is shown when reverted');
  });
});

test('Toggle Edit Visualization', function(assert) {
  assert.expect(3);

  /* == Visit report == */
  visit('/reports/1/view');

  /* == Verify visualization config is not shown == */
  andThen(() => {
    assert.notOk(
      !!find('.report-view__visualization-edit').length,
      'visualization config is closed on initial report load'
    );
  });

  /* == Open config == */
  click('.report-view__visualization-edit-btn');
  andThen(() => {
    assert.ok(
      !!find('.report-view__visualization-edit').length,
      'visualization config is opened after clicking edit button'
    );
  });

  /* == Close config == */
  click('.report-view__visualization-edit-btn');
  andThen(() => {
    assert.notOk(
      !!find('.report-view__visualization-edit').length,
      'visualization config is closed after clicking edit button'
    );
  });
});

test('Disabled Visualization Edit', function(assert) {
  assert.expect(4);

  // Visit report and make a change that invalidates visualization
  visit('/reports/1/view');
  click('.grouped-list__item:contains(Product Family) .checkbox-selector__checkbox');
  andThen(() => {
    assert.notOk(
      find('.report-view__visualization-edit-btn').is(':visible'),
      'Edit visualization button is no longer visible'
    );

    assert.equal(
      find('.report-view__info-text')
        .text()
        .trim(),
      'Run request to update Line Chart',
      'Notification to run request is visible'
    );
  });

  // Run report
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.report-view__visualization-edit-btn').is(':visible'),
      'After running, edit visualization button is once again visible'
    );

    assert.notOk(
      find('.report-view__info-text').is(':visible'),
      'After running, notification to run is no longer visible'
    );
  });
});

test('Disabled Visualization Edit While Editing', function(assert) {
  assert.expect(9);

  visit('/reports/2/view');
  click('.report-view__visualization-edit-btn');
  andThen(() => {
    assert.ok(
      find('.report-view__visualization-edit').is(':visible'),
      'Visualization edit panel is visible after clicking the edit button'
    );
  });

  // Make a change that does NOT invalidate visualization
  fillIn('.table-header-cell.dateTime input', 'Foo');
  triggerEvent('.table-header-cell.dateTime input', 'blur');
  andThen(() => {
    assert.ok(
      find('.report-view__visualization-edit').is(':visible'),
      'Visualization edit panel is still visible after making changes that do not change the request'
    );

    assert.ok(
      find('.report-view__visualization-edit-btn').is(':visible'),
      'Visualization edit button is is still visible after making changes that do not change the request'
    );

    assert.notOk(
      find('.report-view__info-text').is(':visible'),
      'Notification to run is not visible after making changes that do not change the request'
    );
  });

  // Make a change that invalidates visualization
  click('.grouped-list__item:contains(Product Family) .checkbox-selector__checkbox');
  andThen(() => {
    assert.notOk(
      find('.report-view__visualization-edit').is(':visible'),
      'Visualization edit panel is no longer visible when there are request changes that have not been run'
    );

    assert.notOk(
      find('.report-view__visualization-edit-btn').is(':visible'),
      'Visualization edit button is no longer visible when there are request changes that have not been run'
    );

    assert.ok(
      find('.report-view__info-text').is(':visible'),
      'Notification to run is visible when there are request changes that have not been run'
    );
  });

  // Run report
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.report-view__visualization-edit-btn').is(':visible'),
      'Visualization edit button is visible again after running the report'
    );

    assert.notOk(
      find('.report-view__info-text').is(':visible'),
      'Notification to run is no longer visible after running the report'
    );
  });
});

test('Save changes', function(assert) {
  assert.expect(2);

  visit('/reports/1/view');
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.ok(
      $('.navi-report__save-btn').is(':visible'),
      'Save changes button is visible once a change has been made and when owner of report'
    );
  });

  visit('/reports/3/view');
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      $('.navi-report__save-btn').is(':visible'),
      'Save changes button is visible when not owner of a report'
    );
  });
});

test('Error route', function(assert) {
  assert.expect(1);

  //suppress errors and exceptions for this test
  let originalLoggerError = Ember.Logger.error,
    originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};

  visit('/reports/invalidRoute');
  andThen(() => {
    assert.equal(
      $('.report-not-found')
        .text()
        .replace(/\s+/g, ' ')
        .trim(),
      'Oops! Something went wrong with this report. Try going back to where you were last or to the reports page.',
      'An error message is displayed for an invalid route'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});

test('Error data request', function(assert) {
  assert.expect(1);

  server.get(`${config.navi.dataSources[0].uri}/v1/data/*path`, () => {
    return new Mirage.Response(400, {}, { description: 'Cannot merge mismatched time grains month and day' });
  });

  //suppress errors and exceptions for this test
  let originalLoggerError = Ember.Logger.error,
    originalException = Ember.Test.adapter.exception;

  Ember.Logger.error = function() {};
  Ember.Test.adapter.exception = function() {};

  visit('/reports/5/view');
  andThen(() => {
    assert.equal(
      $('.navi-report-error__info-message')
        .text()
        .replace(/\s+/g, ' ')
        .trim(),
      'Oops! There was an error with your request. Cannot merge mismatched time grains month and day',
      'An error message is displayed for an invalid request'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });
});

test('Updating chart series', function(assert) {
  assert.expect(3);

  // Check inital series
  visit('/reports/1/view');
  andThen(() => {
    let seriesLabels = find('.c3-legend-item')
      .map(function() {
        return this.textContent.trim();
      })
      .get();
    assert.deepEqual(seriesLabels, ['Property 1', 'Property 2', 'Property 3'], '3 series are initially present');
  });

  // Delete a series
  click('.report-view__visualization-edit-btn');
  click('.series-collection .navi-icon__delete:eq(1)');
  andThen(() => {
    let seriesLabels = find('.c3-legend-item')
      .map(function() {
        return this.textContent.trim();
      })
      .get();
    assert.deepEqual(seriesLabels, ['Property 1', 'Property 3'], 'Selected series has been deleted from chart');
  });

  // Add a series
  click('.add-series .table-row:contains(Property 4)');
  andThen(() => {
    let seriesLabels = find('.c3-legend-item')
      .map(function() {
        return this.textContent.trim();
      })
      .get();
    assert.deepEqual(seriesLabels, ['Property 1', 'Property 3', 'Property 4'], 'Selected series has been added chart');
  });
});

test('favorite reports', function(assert) {
  assert.expect(3);

  // Filter by favorites
  visit('/reports');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedReports = find('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'Report 2 is in favorites section');
  });

  // Favorite report 1
  visit('/reports/1');
  click('.favorite-item');

  // Filter by favorites
  visit('/reports');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedReports = find('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );

    assert.deepEqual(listedReports, ['Hyrule News', 'Hyrule Ad&Nav Clicks'], 'Two reports are in favorites now');
  });

  // Unfavorite report 2
  click('tbody tr td a:contains(Hyrule Ad&Nav Clicks)');
  click('.favorite-item');
  visit('/reports');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedReports = find('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );

    assert.deepEqual(listedReports, ['Hyrule News'], 'Only one report is in favorites now');
  });
});

test('favorite report - rollback on failure', function(assert) {
  assert.expect(2);

  // Mock server path endpoint to mock failure
  server.urlPrefix = `${config.navi.appPersistence.uri}`;
  server.patch('/users/:id', () => {
    return new Mirage.Response(500);
  });

  // Filter by favorites
  visit('/reports');
  click('.pick-form li:contains(Favorites)');

  andThen(() => {
    let listedReports = find('tbody tr td:first-of-type')
      .toArray()
      .map(el =>
        $(el)
          .text()
          .trim()
      );

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'Report 2 is in favorites section');
  });

  visit('/reports/1');

  andThen(() => {
    click('.favorite-item');

    andThen(() => {
      visit('/reports');
      andThen(() => {
        click('.pick-form li:contains(Favorites)');

        andThen(() => {
          let listedReports = find('tbody tr td:first-of-type')
            .toArray()
            .map(el =>
              $(el)
                .text()
                .trim()
            );

          assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'The user state is rolled back on failure');
        });
      });
    });
  });
});

test('running report after reverting changes', function(assert) {
  assert.expect(2);

  /* == Modify report by adding a metric == */
  visit('/reports/1/view');
  click('.visualization-toggle__option:contains(Data Table)');
  click('.checkbox-selector--metric .grouped-list__item:contains(Time Spent) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      $('.table-header-row-vc--view .table-header-cell:contains(Time Spent)').is(':visible'),
      'Time Spent column is displayed'
    );
  });

  /* == Revert report to its original state == */
  click('.checkbox-selector--metric .grouped-list__item:contains(Time Spent) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.notOk(
      $('.table-header-row-vc--view .table-header-cell:contains(Time Spent)').is(':visible'),
      'Time Spent column is not displayed'
    );
  });
});

test('Running a report against unauthorized table shows unauthorized route', function(assert) {
  assert.expect(5);
  visit('/reports/1/view');

  selectChoose('.navi-table-select__dropdown', 'Protected Table');

  click('.navi-report__run-btn');
  andThen(() => {
    assert.equal(currentURL(), '/reports/1/unauthorized', 'check to seee if we are on the unauthorized route');

    assert.ok(!!find('.navi-report-invalid__info-message .fa-lock').length, 'unauthorized component is loaded');
  });

  selectChoose('.navi-table-select__dropdown', 'Network');
  click('.navi-report__run-btn');
  click('.visualization-toggle__option:contains(Table)');
  andThen(() => {
    assert.equal(currentURL(), '/reports/1/view', 'check to seee if we are on the view route');

    assert.notOk(!!find('.navi-report-invalid__info-message .fa-lock').length, 'unauthorized component is not loaded');

    assert.ok(!!find('.table-widget').length, 'Data table visualization loads');
  });
});

test("filtering on a dimension with a storage strategy of 'none'", function(assert) {
  assert.expect(7);

  //Add filter for a dimension where storageStrategy is 'none' and try to run the report
  visit('/reports/1/view');
  click('.grouped-list__group-header:contains(test)');
  click('.grouped-list__item:contains(Context Id)');
  click('.grouped-list__item:contains(Context Id) > .checkbox-selector__filter');
  click('.navi-report__run-btn');

  andThen(() => {
    assert.equal(
      find('.navi-info-message__error-list-item')
        .text()
        .trim(),
      'Context Id filter needs at least one value',
      'Error message is shown when trying to run a report with an empty filter'
    );
  });

  //Give the filter a value that will not match any dimension values
  fillIn('.emberTagInput-new>input', 'This_will_not_match_any_dimension_values');
  triggerEvent('.js-ember-tag-input-new', 'blur');
  andThen(() => {
    assert.notOk(
      find('.navi-info-message__error-list-item').is(':visible'),
      'No errors are shown after giving a value to filter on'
    );

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/*path', (db, request) => {
      assert.equal(
        get(request, 'queryParams.filters'),
        'contextId|id-in[This_will_not_match_any_dimension_values]',
        "Filter value is passed even when the value doesn'nt match any dimension IDs"
      );

      return { rows: [] };
    });
  });

  //Run the report with the invalid dimension value to filter on
  click('.navi-report__run-btn');
  andThen(() => {
    assert.notOk(
      find('.navi-report-invalid__info-message').is(':visible'),
      'The report is run even when no dimension values match the filter'
    );
  });

  //Give the filter an empty value
  click('.emberTagInput-remove');
  triggerEvent('.filter-values--multi-value-input', 'blur');
  click('.navi-report__run-btn');

  andThen(() => {
    assert.equal(
      find('.navi-info-message__error-list-item')
        .text()
        .trim(),
      'Context Id filter needs at least one value',
      'Error message is shown when trying to run a report with an empty filter value'
    );

    assert.ok(
      find('.filter-values--multi-value-input--error').is(':visible'),
      'Filter value input validation errors are shown'
    );
  });

  click('.grouped-list__item:contains(Operating System)');
  click('.grouped-list__item:contains(Operating System) > .checkbox-selector__filter');

  andThen(() => {
    assert.ok(
      find('.filter-values--dimension-select').is(':visible'),
      "Dimension select is used when the dimension's storage strategy is not 'none'"
    );
  });
});

test('filter - add and remove using filter icon', function(assert) {
  assert.expect(4);

  visit('/reports/1');
  //add dimension filter
  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  andThen(() => {
    assert.ok(
      find('.filter-builder__subject:contains(Operating System)').is(':visible'),
      'The Operating System dimension filter is added'
    );
  });

  //remove filter by clicking on filter icon again
  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  andThen(() => {
    assert.notOk(
      find('.filter-builder__subject:contains(Operating System)').is(':visible'),
      'The Operating System dimension filter is removed when filter icon is clicked again'
    );
  });

  //add metric filter
  click('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter');
  andThen(() => {
    assert.ok(
      find('.filter-builder__subject:contains(Ad Clicks)').is(':visible'),
      'The Ad Clicks metric filter is added'
    );
  });

  //remove metric filter by clicking on filter icon again
  click('.grouped-list__item:contains(Ad Clicks) .checkbox-selector__filter');
  andThen(() => {
    assert.notOk(
      find('.filter-builder__subject:contains(Ad Clicks)').is(':visible'),
      'The Ad Clicks metric filter is removed when filter icon is clicked again'
    );
  });
});

test('Show selected dimensions and filters', function(assert) {
  assert.expect(4);

  visit('/reports/1');

  // Add Dimension
  click('.grouped-list__item:contains(Operating System) .grouped-list__item-label');
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(
      $('.report-builder__dimension-selector .grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Day', 'Property', 'Operating System'],
      'Initially selected items include selected dimensions, filters and timegrains'
    );
  });

  // Add selected dimension as filter
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(
      $('.report-builder__dimension-selector .grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Day', 'Property', 'Operating System'],
      'Adding a selected dimension as filter does not change the selected items'
    );
  });

  // Remove the dimension filter
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(
      $('.report-builder__dimension-selector .grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Day', 'Property', 'Operating System'],
      'Removing a filter of a dimension already selected does not change selected items'
    );
  });

  // // Remove Dimension
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  click('.grouped-list__item:contains(Operating System) .grouped-list__item-label');
  click('.report-builder__dimension-selector .navi-list-selector__show-link');
  andThen(() => {
    assert.deepEqual(
      $('.report-builder__dimension-selector .grouped-list__item')
        .toArray()
        .map(el => el.textContent.trim()),
      ['Day', 'Property'],
      'Removing a dimension as a filter and dimension changes the selected items'
    );
  });
});

test('Test filter "Is Empty" is accepted', function(assert) {
  assert.expect(2);
  visit('/reports/1');

  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  selectChoose('.filter-collection__row:last-of-type .filter-builder__operator', 'Is Empty');
  click('.navi-report__run-btn');

  andThen(() => {
    assert.ok(
      !!find('.line-chart-widget').length,
      'line-chart visualization is shown instead of validation error when Is Empty is picked'
    );

    assert.notEqual(
      find('.navi-info-message__error-list-item')
        .text()
        .trim(),
      'A filter cannot have any empty values',
      'Should not show empty values error'
    );
  });
});

test('Test filter "Is Not Empty" is accepted', function(assert) {
  assert.expect(2);
  visit('/reports/1');

  click('.grouped-list__item:contains(Operating System) .checkbox-selector__filter');
  selectChoose('.filter-collection__row:last-of-type .filter-builder__operator', 'Is Not Empty');
  click('.navi-report__run-btn');

  andThen(() => {
    assert.ok(
      !!find('.line-chart-widget').length,
      'line-chart visualization is shown instead of validation error when Is Not Empty is  picked'
    );

    assert.notEqual(
      find('.navi-info-message__error-list-item')
        .text()
        .trim(),
      'A filter cannot have any empty values',
      'Should not show empty values error'
    );
  });
});

test('Date Picker doesn`t change date when moving to time grain where dates are valid', function(assert) {
  assert.expect(3);

  visit('/reports/1');
  click('.grouped-list__item-label:contains(Month)');
  andThen(() => {
    // Select the month Jan
    click('.custom-range-form .pick-value');
    click('.datepicker:eq(0) .month:contains(Jan)');
    click('.datepicker:eq(1) .month:contains(Jan)');
    click('.navi-date-range-picker__apply-btn');
    click('.navi-report__run-btn');
    andThen(() => {
      assert.equal(
        find('.date-range__select-trigger')
          .text()
          .trim(),
        'Jan 2015',
        'Month is changed to Jan 2015'
      );
    });

    click('.grouped-list__item-label:contains(Day)');
    click('.navi-report__run-btn');
    andThen(() => {
      assert.equal(
        find('.date-range__select-trigger')
          .text()
          .trim(),
        'Jan 01, 2015 - Jan 31, 2015',
        'Switching to day preserves the day casts the dates to match the time period'
      );
    });

    click('.grouped-list__item-label:contains(Week)');
    click('.navi-report__run-btn');
    andThen(() => {
      assert.equal(
        find('.date-range__select-trigger')
          .text()
          .trim(),
        'Dec 29, 2014 - Jan 25, 2015',
        'Switching to week casts the dates to match the start and end of the date time period'
      );
    });
  });
});

test("Report with an unknown table doesn't crash", function(assert) {
  assert.expect(1);
  visit('/reports/9');

  andThen(() => {
    assert.equal(
      find('.navi-info-message__error-list-item')
        .text()
        .trim(),
      'Table is invalid or unavailable',
      'Should show an error message when table cannot be found in metadata'
    );
  });
});

test('Filter with large cardinality dimensions value selection works', function(assert) {
  assert.expect(2);
  let option,
    dropdownSelector = '.filter-values--dimension-select';
  visit('/reports/new');

  // Load table A as it has the large cardinality dimensions, and choose a large cardinality dimension
  andThen(() => {
    selectChoose('.navi-table-select__dropdown', 'Table A');
    click('.grouped-list__item:Contains(EventId) .grouped-list__item-label');
    click('.grouped-list__item:Contains(Network Sessions) .grouped-list__item-label');
    click('.navi-report__footer button:Contains(Run)');
  });

  // Grab one of the dim names after running a report
  andThen(() => {
    option = find('.table-cell-content.dimension')[0].textContent.trim();
    click('.grouped-list__item:Contains(EventId) .checkbox-selector__filter');
  });

  // Open the dimension values so we can get values as they are dynamically created by mirage
  andThen(() => {
    click(dropdownSelector + ' .ember-power-select-trigger');
  });

  // Parse the options from the dropdown, and then select the first item.
  andThen(() => {
    let message = find(
      '.filter-values--dimension-select__dropdown .ember-power-select-option--search-message'
    )[0].textContent.trim();
    assert.equal(message, 'Type to search', 'Message is correct');
  });

  // Simulate typing a search which pulls large cardinality dimension values from the server
  andThen(() => {
    selectSearch(dropdownSelector, option.toLowerCase().substring(0, 3));
    click('.filter-values--dimension-select__dropdown .ember-power-select-option:contains(' + option + ')');
  });

  // Check if the selected item is still selected after the search
  andThen(() => {
    assert.equal(
      find('.filter-values--dimension-select__dropdown .ember-power-select-option:contains(' + option + ')').attr(
        'aria-selected'
      ),
      'true',
      'The value is selected after a search is done'
    );
  });
});

test('adding metrics to reordered table keeps order', function(assert) {
  assert.expect(2);
  visit('/reports/2');

  andThen(() => {
    return reorder(
      'mouse',
      '.table-header-row-vc--view .table-header-cell',
      '.table-header-row-vc--view .metric:contains(Nav Clicks)',
      '.table-header-row-vc--view .dimension:contains(Property)',
      '.table-header-row-vc--view .metric:contains(Ad Clicks)',
      '.table-header-row-vc--view .dateTime'
    );
  });

  andThen(() => {
    assert.deepEqual(
      find('.table-header-row-vc--view .table-header-cell__title')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Nav Clicks', 'Property', 'Ad Clicks', 'Date'],
      'The headers are reordered as specified by the reorder'
    );

    click('.grouped-list__item-label:contains(Total Clicks)');
    click('.navi-report__run-btn');
  });

  andThen(() => {
    assert.deepEqual(
      find('.table-header-row-vc--view .table-header-cell__title')
        .toArray()
        .map(el =>
          $(el)
            .text()
            .trim()
        ),
      ['Nav Clicks', 'Property', 'Ad Clicks', 'Date', 'Total Clicks'],
      'The headers are reordered as specified by the reorder'
    );
  });
});

test('Parameterized metrics with default displayname are not considered custom', function(assert) {
  assert.expect(2);
  visit('/reports/8');

  andThen(() => {
    assert.ok(
      find('.table-header-row-vc--view .table-header-cell.metric > .table-header-cell__title').length,
      'renders metric columns'
    );
    assert.notOk(
      find('.table-header-row-vc--view .table-header-cell.metric > .table-header-cell__title').is(
        '.table-header-cell__title--custom-name'
      ),
      'Parameterized metrics with default display name should not be considered custom'
    );
  });
});

test('Cancel Report', function(assert) {
  //Slow down mock
  server.timing = 400;
  server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
  server.get('data/*path', () => {
    return { rows: [] };
  });

  //Load the report
  visitWithoutWait('/reports/1');
  waitForElement('.navi-report__cancel-btn').then(() => {
    assert.equal(currentPath(), 'reports.report.loading', 'Report is loading');

    assert.deepEqual(
      find('.navi-report__footer .btn')
        .toArray()
        .map(e =>
          $(e)
            .text()
            .trim()
        ),
      ['Cancel'],
      'When report is loading, the only footer button is `Cancel`'
    );
  });

  //Cancel the report
  click('.navi-report__cancel-btn');
  andThen(function() {
    assert.equal(currentPath(), 'reports.report.edit', 'Clicking `Cancel` brings the user to the edit route');

    assert.deepEqual(
      find('.navi-report__footer .btn')
        .toArray()
        .map(e =>
          $(e)
            .text()
            .trim()
        ),
      ['Run'],
      'When not loading a report, the standard footer buttons are available'
    );
  });

  //Run the widget
  click('.navi-report__run-btn');
  andThen(function() {
    assert.equal(currentPath(), 'reports.report.view', 'Running the report brings the user to the view route');

    assert.deepEqual(
      find('.navi-report__footer .btn')
        .toArray()
        .map(e =>
          $(e)
            .text()
            .trim()
        ),
      ['Run'],
      'When not loading a report, the standard footer buttons are available'
    );
  });
});
