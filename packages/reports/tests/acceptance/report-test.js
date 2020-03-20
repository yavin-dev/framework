import Component from '@ember/component';
import { get } from '@ember/object';
import Ember from 'ember';
import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL, find, findAll, blur, triggerEvent, waitFor } from '@ember/test-helpers';
import $ from 'jquery';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import { selectChoose, selectSearch } from 'ember-power-select/test-support';
import { setupApplicationTest } from 'ember-qunit';
import reorder from '../helpers/reorder';
import config from 'ember-get-config';
import { Response } from 'ember-cli-mirage';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';
import {
  clickItem,
  clickItemFilter,
  getTimeGrainCheckbox,
  getAllSelected,
  getItem
} from 'navi-reports/test-support/report-builder';
import { animationsSettled } from 'ember-animated/test-support';

// Regex to check that a string ends with "{uuid}/view"
const TempIdRegex = /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/view$/;

// Regex to check that a string ends with "{integer}/view"
const PersistedIdRegex = /\/\d+\/view$/;

let CompressionService;

module('Acceptance | Navi Report', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    CompressionService = this.owner.lookup('service:compression');
    // Mocking add-to-dashboard component
    this.owner.application.register(
      'component:report-actions/add-to-dashboard',
      Component.extend({ classNames: 'add-to-dashboard' }),
      { instantiate: false }
    );

    config.navi.FEATURES.enableVerticalCollectionTableIterator = true;
  });

  hooks.afterEach(function() {
    config.navi.FEATURES.enableVerticalCollectionTableIterator = false;
  });

  test('validation errors', async function(assert) {
    assert.expect(3);

    // Make an invalid change and run report
    await visit('/reports/1');
    await clickItemFilter('dimension', 'Operating System');
    await click('.navi-report__run-btn');

    assert.equal(currentURL(), '/reports/1/invalid', 'User is transitioned to invalid route');

    let errors = findAll('.navi-info-message__error-list-item').map(el => find(el).innerText.trim());
    assert.deepEqual(errors, ['Operating System filter needs at least one value'], 'Form errors are displayed to user');

    // Fix the errors and run report
    await click('.filter-collection__row:nth-of-type(2) .filter-collection__remove');
    await click('.navi-report__run-btn');

    assert.equal(currentURL(), '/reports/1/view', 'Fixing errors and clicking "Run" returns user to view route');
  });

  test('Clone report', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/clone');

    assert.dom('.report-view').exists('The route transistions to report view');

    assert.equal(find('.navi-report__title').innerText.trim(), 'Copy Of Hyrule News', 'Cloned report is being viewed');
  });

  test('Clone invalid report', async function(assert) {
    assert.expect(1);

    await visit('/reports/1');
    // Add a metric filter
    await clickItemFilter('dimension', 'Operating System');
    await click($('.navi-report__action-link:contains(Clone)')[0]);

    assert.ok(currentURL().endsWith('edit'), 'An invalid new report transitions to the reports/:id/edit route');
  });

  test('New report', async function(assert) {
    assert.expect(4);

    await visit('/reports/new');

    /* == Add filter == */
    await clickItemFilter('dimension', 'Operating System');

    /* == Run with errors == */
    await click('.navi-report__run-btn');

    assert.ok(
      currentURL().endsWith('/invalid'),
      'After clicking the run button, the route transitions to the invalid route'
    );

    /* == Fix errors == */
    await clickItemFilter('dimension', 'Operating System');
    await clickItem('metric', 'Ad Clicks');
    await click('.navi-report__run-btn');

    assert.ok(currentURL().endsWith('/view'), 'Running a report with no errors transitions to view route');

    assert.ok(!!findAll('.table-widget').length, 'Data table visualization is shown by default');

    assert.ok(
      !!findAll('.table-header-row-vc--view .table-header-cell').filter(el => el.innerText.includes('Ad Clicks'))
        .length,
      'Ad Clicks column is displayed'
    );
  });

  test('New report - copy api', async function(assert) {
    assert.expect(2);

    await visit('/reports/new');
    await clickItem('metric', 'Ad Clicks');
    await click('.navi-report__copy-api-btn .get-api__btn');

    assert.dom('.get-api-modal-container').isVisible('Copy modal is open after fixing error clicking button');

    /* == Add some more metrics and check that copy modal updates == */
    await click('.navi-modal__close');
    await clickItem('metric', 'Additive Page Views');
    await click('.navi-report__copy-api-btn .get-api__btn');

    assert.ok(
      find('.navi-modal__input').value.includes('metrics=adClicks%2CaddPageViews'),
      'API query updates with request'
    );
  });

  test('Revert changes when exiting report - existing report', async function(assert) {
    assert.expect(5);

    // visit report 1
    await visit('/reports/1/view');

    let dayTimeGrain = await getTimeGrainCheckbox('Day');
    assert.dom(dayTimeGrain.item).isChecked('Day timegrain is checked by default');
    await dayTimeGrain.reset();

    // uncheck the day timegrain
    await clickItem('timeGrain', 'Day');

    dayTimeGrain = await getTimeGrainCheckbox('Day');
    assert.dom(dayTimeGrain.item).isNotChecked('Day timegrain is unchecked after clicking on it');
    await dayTimeGrain.reset();

    assert.dom('.navi-report__revert-btn').isVisible('Revert changes button is visible once a change has been made');

    // leave the route
    await visit('/reports');

    // enter the route again
    await click("a[href$='/reports/1/view']");

    assert
      .dom('.navi-report__revert-btn')
      .isNotVisible('After navigating away and back to the route, the Revert button disappears');

    dayTimeGrain = await getTimeGrainCheckbox('Day');
    assert.dom(dayTimeGrain.item).isChecked('After navigating away and back to the route, changes are reverted');
    await dayTimeGrain.reset();
  });

  test('Revert changes - existing report', async function(assert) {
    assert.expect(4);

    await visit('/reports/1/view');

    assert.ok(
      !!$('.filter-builder__subject:contains(Day)').length,
      'After navigating to a route, the Timegrain "Day" option is visible'
    );

    // Remove a metric
    await clickItem('timeGrain', 'Week');

    assert.dom('.navi-report__revert-btn').isVisible('Revert changes button is visible once a change has been made');

    await click('.navi-report__revert-btn');

    assert.ok(
      !!$('.filter-builder__subject:contains(Day)').length,
      'After navigating out of the route, the report model is rolled back'
    );

    assert.dom('.navi-report__revert-btn').isNotVisible('After clicking "Revert Changes", button is once again hidden');
  });

  test('Revert changes - new report', async function(assert) {
    assert.expect(2);

    await visit('/reports/new');

    assert.dom('.navi-report__revert-btn').isNotVisible('Revert changes button is not initially visible');

    await clickItem('metric', 'Ad Clicks');

    assert
      .dom('.navi-report__revert-btn')
      .isNotVisible('Revert changes button is not visible on a new report even after making a change');
  });

  test('Revert and Save report', async function(assert) {
    assert.expect(4);

    await visit('/reports');
    await visit('/reports/new');

    //Add three metrics and save the report
    await clickItem('metric', 'Page Views');
    await click('.navi-report__save-btn');

    server.patch('/reports/:id', function({ reports }, request) {
      assert.equal(
        request.requestHeaders['Content-Type'],
        'application/vnd.api+json',
        'Request header content-type is correct JSON-API mime type'
      );
      assert.equal(
        request.requestHeaders.Accept,
        'application/vnd.api+json',
        'Request header accept is correct JSON-API mime type'
      );
      const id = request.params.id;
      let attrs = this.normalizedRequestAttrs();

      return reports.find(id).update(attrs);
    });

    //remove a metric and save the report
    await clickItem('metric', 'Total Page Views');
    await click('.navi-report__save-btn');

    //remove another metric and run the report
    await clickItem('metric', 'Additive Page Views');
    await click('.navi-report__run-btn');

    //revert changes
    await click('.navi-report__revert-btn');

    let emberId = find('.report-view.ember-view').id,
      component = this.owner.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after running then reverting.'
    );

    //run after reverting
    await click('.navi-report__run-btn');

    assert
      .dom('.navi-info-message.navi-report-error__info-message.ember-view')
      .isNotVisible('Error message is not displayed when reverting and running');
  });

  test('Cancel Save As report', async function(assert) {
    assert.expect(6);

    await visit('/reports');
    await visit('/reports/new');

    //Add a metrics and save the report
    await clickItem('metric', 'Additive Page Views');
    await click('.navi-report__save-btn');

    // Change the Dim
    await clickItem('timeGrain', 'Week');

    // And click Save AS the report
    await click('.navi-report__save-as-btn');

    // The Modal with buttons is Visible
    assert.dom('.save-as__cancel-modal-btn').isVisible('Save As Modal is visible with cancel key');

    // Press the Modal X button
    await click('.navi-modal__close');

    // Changes were not reverted, but they were not saved
    assert.ok(
      !!$('.filter-builder__subject:contains(Week)').length,
      'On cancel the dirty state of the report still remains'
    );

    let emberId = find('.report-view.ember-view').id,
      component = this.owner.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after closing Save-As Modal'
    );

    // And click Save AS the report
    await click('.navi-report__save-as-btn');

    // The Modal with buttons is Visible
    assert.dom('.save-as__cancel-modal-btn').isVisible('Save As Modal is visible with cancel key');

    // Press the Modal cancel button
    await click('.save-as__cancel-modal-btn');

    // Changes were not reverted, but they were not saved
    assert.ok(
      !!$('.filter-builder__subject:contains(Week)').length,
      'On cancel the dirty state of the report still remains'
    );

    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after canceling Save-As.'
    );
  });

  test('Save As report', async function(assert) {
    assert.expect(6);

    await visit('/reports/1');

    // Change the Dim
    await clickItem('timeGrain', 'Week');

    // And click Save AS the report
    await click('.navi-report__save-as-btn');

    // The Modal with buttons is Visible

    assert.dom('.save-as__save-as-modal-btn').isVisible('Save As Modal is visible with save as key');

    // Press the save as
    await click('.save-as__save-as-modal-btn');

    assert.ok(!!$('.filter-builder__subject:contains(Week)').length, 'The new Dim is shown in the new report.');

    // New Report is run
    let emberId = find('.report-view.ember-view').id,
      component = this.owner.lookup('-view-registry:main')[emberId];
    assert.equal(
      component.get('report.visualization.type'),
      'table',
      'Report has a valid visualization type after running then reverting.'
    );

    assert.dom('.navi-report__title').hasText('(New Copy) Hyrule News', 'New Saved Report is being viewed');

    await visit('/reports/1');

    assert.ok(!!$('.filter-builder__subject:contains(Day)').length, 'Old unsaved report have the old DIM.');

    assert.dom('.navi-report__title').hasText('Hyrule News', 'Old Report with unchanged title is being viewed.');
  });

  test('Save As on failure', async function(assert) {
    assert.expect(3);

    server.urlPrefix = `${config.navi.appPersistence.uri}`;
    server.post('/reports', () => new Response(500));

    await visit('/reports/1');

    // Change the Dim
    await clickItem('timeGrain', 'Week');

    // And click Save AS the report
    await click('.navi-report__save-as-btn');

    // Press the save as
    await click('.save-as__save-as-modal-btn');

    // An error will occur and it will go back to old report dirty state

    // Check URL
    assert.equal(currentURL(), '/reports/1/view', 'The url shows report 1');

    // Old Report
    assert.dom('.navi-report__title').hasText('Hyrule News', 'Old Report with unchanged title is being viewed.');

    // Dirty state of old
    assert.ok(!!$('.filter-builder__subject:contains(Week)').length, 'Old unsaved report have the old DIM.');
  });

  test('Save report', async function(assert) {
    assert.expect(4);

    await visit('/reports');
    await visit('/reports/new');

    assert.dom('.navi-report__save-btn').isVisible('Save button is visible in the new route');

    // Build a report
    await clickItem('metric', 'Ad Clicks');
    await click('.navi-report__run-btn');

    assert.ok(TempIdRegex.test(currentURL()), 'Creating a report brings user to /view route with a temp id');

    await click('.navi-report__save-btn');

    assert.ok(PersistedIdRegex.test(currentURL()), 'After saving, user is brought to /view route with persisted id');

    assert
      .dom('.navi-report__save-btn')
      .isNotVisible('Save button is not visible when report is saved and has no changes');
  });

  test('Clone action', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await click($('.navi-report__action-link:contains(Clone)')[0]);

    assert.ok(
      TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id'
    );

    assert.dom('.navi-report__title').hasText('Copy of Hyrule News', 'Cloned report is being viewed');
  });

  test('Clone action - enabled/disabled', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');

    assert
      .dom($('.navi-report__action-link:contains(Clone)')[0])
      .hasNoClass('navi-report__action-link--force-disabled', 'Clone action is enabled for a valid report');

    // Remove all metrics to create , but do not save
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    assert
      .dom($('.navi-report__action-link:contains(Clone)')[0])
      .hasNoClass('navi-report__action-link--force-disabled', 'Clone action is enabled from a valid save report');
  });

  test('Export action - enabled/disabled', async function(assert) {
    assert.expect(4);

    await visit('/reports/1/view');

    assert
      .dom($('.navi-report__action-link:contains(Export)')[0])
      .hasNoClass('navi-report__action-link--force-disabled', 'Export action is enabled for a valid report');

    // Add new dimension to make it out of sync with the visualization
    await clickItem('dimension', 'Product Family');

    assert
      .dom($('.navi-report__action-link:contains(Export)')[0])
      .hasClass('navi-report__action-link--force-disabled', 'Export action is disabled when report is not valid');

    // Remove new dimension to make it in sync with the visualization
    await clickItem('dimension', 'Product Family');

    assert
      .dom($('.navi-report__action-link:contains(Export)')[0])
      .hasNoClass('navi-report__action-link--force-disabled', 'Export action is enabled for a valid report');

    // Remove all metrics to create an invalid report
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    assert
      .dom($('.navi-report__action-link:contains(Export)')[0])
      .hasClass('navi-report__action-link--force-disabled', 'Export action is disabled when report is not valid');
  });

  test('Export action - href', async function(assert) {
    assert.expect(4);

    let originalFeatureFlag = config.navi.FEATURES.enableMultipleExport;

    // Turn flag off
    config.navi.FEATURES.enableMultipleExport = false;

    await visit('/reports/1/view');

    assert.ok(
      $('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('/network/day/property/?dateTime='),
      'Export url contains dimension path param'
    );

    /* == Add groupby == */
    await clickItem('dimension', 'Product Family');
    await click('.navi-report__run-btn');

    assert.ok(
      $('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('/network/day/property/productFamily/?dateTime='),
      'Groupby changes are automatically included in export url'
    );

    assert.notOk(
      $('.navi-report__action-link:contains(Export)')
        .attr('href')
        .includes('filter'),
      'No filters are initially present in export url'
    );

    /* == Add filter == */
    await click('.navi-report__run-btn');
    await clickItemFilter('dimension', 'Product Family');

    /* == Update filter value == */
    await selectChoose('.filter-values--dimension-select__trigger', '(1)');
    await click('.navi-report__run-btn');

    assert.ok(
      decodeURIComponent($('.navi-report__action-link:contains(Export)').attr('href')).includes(
        'productFamily|id-in["1"]'
      ),
      'Filter updates are automatically included in export url'
    );

    config.navi.FEATURES.enableMultipleExport = originalFeatureFlag;
  });

  test('Multi export action - csv href', async function(assert) {
    assert.expect(4);

    await visit('/reports/1/view');
    await clickTrigger('.multiple-format-export');

    assert.ok(
      $('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('/network/day/property/?dateTime='),
      'Export url contains dimension path param'
    );

    /* == Add groupby == */
    await clickItem('dimension', 'Product Family');
    await click('.navi-report__run-btn');
    await clickTrigger('.multiple-format-export');

    assert.ok(
      $('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('/network/day/property/productFamily/?dateTime='),
      'Groupby changes are automatically included in export url'
    );

    assert.notOk(
      $('.multiple-format-export__dropdown a:contains(CSV)')
        .attr('href')
        .includes('filter'),
      'No filters are initially present in export url'
    );

    /* == Add filter == */
    await clickItemFilter('dimension', 'Product Family');
    /* == Update filter value == */
    await selectChoose('.filter-values--dimension-select__trigger', '(1)');
    await click('.navi-report__run-btn');
    await clickTrigger('.multiple-format-export');

    assert.ok(
      decodeURIComponent($('.multiple-format-export__dropdown a:contains(CSV)').attr('href')).includes(
        'productFamily|id-in["1"]'
      ),
      'Filter updates are automatically included in export url'
    );
  });

  test('Multi export action - pdf href', async function(assert) {
    assert.expect(4);

    const initialUrl =
      '/export?reportModel=EQbwOsAmCGAu0QFzmAS0kiBGCAaCcsATqgEYCusApgM5IoBuqN50ANqgF5yoD2AdvQiwAngAcqmYB35UAtAGMAFtCKw8EBlSI0-g4Iiz5gAWyrwY8IcGgAPZtZHWa21LWuiJUyKjP9dAhrACgIAZqgA5tZmxKgK0eYk8QYEkADCHAoA1nTAxmKq0DHaucgAvmXGPn4B_ADyRJDaSADaEGJEvBJqTsAAulW-VP56pS0o_EWSKcAACp3dogAEOHma7OTuBigdXdqiUlhYACwQFbgTU1Lzez1LAExBDBtbyO0L-72I2AAMfz-rc6XMzXD53ADMTxepR2YIOMyw_x-j2AFT6FQxlWEqFgbGm32AAAkRERyHilgA5KgAd1yxiIVAAjpsaOpthA2LwInF2AAVaCkPEeAVCmayWDU3hELJBWBDADiRGgqH0BJgvSxpkScTGKBiSSk0HSmRyZwuEH1cSkkwYGTiptRAwg1WGtV1zqGI0CM12iw1TuA4TY1B0rQDKiY_CiBhaAZoUrZiHGFu1yQJNrt2TpHoZCjl3oJ0BoyTKAZVIeebHdwFZqkTEHuAIArHIjnIfgBOJZ_RA9v4AOn-QWGGBmjawLbbWAAbN2fr35wOh46qnBoABlXjkIgKfHO8gmEy9YykVSQABqJT0UgYq3pTJZsEvOmvM1vZ01DLYPAENCUqDEGECEoJQpWsSwEHZYBPD3YByBcUM1jQUd02gJgAH14OaVFzmEcRYIZMQE1yCpgCAAA';
    await visit('/reports/1/view');
    await clickTrigger('.multiple-format-export');

    assert.equal(
      $('.multiple-format-export__dropdown a:contains(PDF)').attr('href'),
      initialUrl,
      'Export url contains serialized report'
    );

    /* == Add groupby == */
    await clickItem('dimension', 'Product Family');
    await click('.navi-report__run-btn');
    await clickTrigger('.multiple-format-export');

    let modelStr = $('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];

    await CompressionService.decompressModel(modelStr).then(model => {
      assert.ok(
        get(model, 'request.dimensions')
          .objectAt(1)
          .get('dimension.name'),
        'productFamily',
        'Groupby changes are automatically included in export url'
      );
    });

    /* == Change to table == */
    await click('.visualization-toggle__option[title="Data Table"]');
    await click('.navi-report__run-btn');
    await clickTrigger('.multiple-format-export');

    modelStr = $('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];
    await CompressionService.decompressModel(modelStr).then(model => {
      assert.equal(
        get(model, 'visualization.type'),
        'table',
        'Visualization type changes are automatically included in export url'
      );
    });

    /* == Add grand total to table == */
    await click('.report-view__visualization-edit-btn');
    await click('.table-config__total-toggle-button--grand-total .x-toggle-btn');
    await click('.navi-report__run-btn');
    await clickTrigger('.multiple-format-export');

    modelStr = $('.multiple-format-export__dropdown a:contains(PDF)')
      .attr('href')
      .split('=')[1];
    await CompressionService.decompressModel(modelStr).then(model => {
      assert.equal(
        get(model, 'visualization.metadata.showTotals.grandTotal'),
        true,
        'Visualization config changes are automatically included in export url'
      );
    });
  });

  test('Get API action - enabled/disabled', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');

    assert
      .dom('.get-api')
      .doesNotHaveClass('.navi-report__action--is-disabled', 'Get API action is enabled for a valid report');

    // Remove all metrics
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    // add filter
    await clickItemFilter('dimension', 'Operating System');

    assert.ok(
      [...find('.get-api').classList].includes('navi-report__action--is-disabled'),
      'Get API action is disabled for an invalid report'
    );
  });

  test('Share report', async function(assert) {
    assert.expect(3);

    /* == Saved report == */
    await visit('/reports/1/view');
    await click($('.navi-report__action:contains(Share) button')[0]);

    assert
      .dom('.navi-modal .primary-header')
      .hasText('Share "Hyrule News"', 'Clicking share action brings up share modal');

    // Remove all metrics to create an invalid report
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    assert
      .dom($('.navi-report__action:contains(Share)')[0])
      .hasNoClass('navi-report__action--is-disabled', 'Share action is disabled for invalid report');

    // Share is disabled on new
    await visit('/reports/new');

    assert
      .dom($('.navi-report__action:contains(Share)')[0])
      .hasNoClass('navi-report__action--is-disabled', 'Share action is disabled for new report');
  });

  test('Share report notifications reset', async function(assert) {
    assert.expect(4);

    /* == Saved report == */
    await visit('/reports/1/view');
    await click($('.navi-report__action:contains(Share) button')[0]);

    assert
      .dom('.navi-modal .primary-header')
      .hasText('Share "Hyrule News"', 'Clicking share action brings up share modal');

    assert.dom('.navi-modal .modal-notification').isNotVisible('Notification banner is not shown');

    await click('.navi-modal .copy-btn');

    assert.dom('.navi-modal .modal-notification').isVisible('Notification banner is shown');

    await click($('.navi-modal .btn:contains(Cancel)')[0]);
    await click($('.navi-report__action:contains(Share) button')[0]);

    assert
      .dom('.navi-modal .modal-notification')
      .isNotVisible('Notification banner is not shown after close and reopen');
  });

  test('Delete report on success', async function(assert) {
    assert.expect(5);

    /* == Delete success == */
    await visit('/reports');

    let reportNames = findAll('.table tbody td:first-child').map(el => el.innerText.trim());

    assert.deepEqual(
      reportNames,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
      'Report 1 is initially listed in reports route'
    );

    await visit('/reports/1/view');
    await click($('.navi-report__action:contains(Delete) button')[0]);

    assert.dom('.primary-header').hasText('Delete "Hyrule News"', 'Delete modal pops up when action is clicked');

    await click('.navi-modal .btn-primary');

    assert.ok(currentURL().endsWith('/reports'), 'After deleting, user is brought to report list view');

    reportNames = findAll('.table tbody td:first-child').map(el => el.innerText.trim());

    assert.deepEqual(reportNames, ['Hyrule Ad&Nav Clicks', 'Report 12'], 'Deleted report is removed from list');

    // /* == Not author == */
    await visit('/reports/3/view');

    assert.notOk(
      !!$('.navi-report__action:contains(Delete)').length,
      'Delete action is not available if user is not the author'
    );
  });

  test('Delete action - enabled at all times', async function(assert) {
    assert.expect(4);

    // Delete is not Disabled on new
    await visit('/reports/new');

    assert
      .dom($('.navi-report__action:contains(Delete)')[0])
      .hasNoClass('navi-report__action--is-disabled', 'Delete action is enabled for a valid report');

    // Delete is not Disabled on valid
    await visit('/reports/1/view');

    assert
      .dom($('.navi-report__action:contains(Delete)')[0])
      .hasNoClass('navi-report__action--is-disabled', 'Delete action is enabled for a valid report');

    /*
     * Remove all metrics to create an invalid report
     * Delete is not Disabled on invalid
     */
    await clickItem('metric', 'Ad Clicks');
    await clickItem('metric', 'Nav Link Clicks');

    assert
      .dom($('.navi-report__action:contains(Delete)')[0])
      .hasNoClass('navi-report__action--is-disabled', 'Delete action is enabled when report is not valid');

    // Check Delete modal appear
    await click($('.navi-report__action:contains(Delete) button')[0]);

    assert.dom('.primary-header').hasText('Delete "Hyrule News"', 'Delete modal pops up when action is clicked');
  });

  test('Delete report on failure', async function(assert) {
    assert.expect(1);

    server.urlPrefix = `${config.navi.appPersistence.uri}`;
    server.delete('/reports/:id', () => new Response(500));

    await visit('/reports/2/view');
    await click($('.navi-report__action:contains(Delete) button')[0]);
    await click('.navi-modal .btn-primary');

    assert.ok(currentURL().endsWith('reports/2/view'), 'User stays on current view when delete fails');
  });

  test('Add to dashboard button - flag false', async function(assert) {
    assert.expect(1);

    let originalFeatures = config.navi.FEATURES;

    // Turn flag off
    config.navi.FEATURES = { dashboards: false };

    await visit('/reports/1/view');

    assert.dom('.add-to-dashboard').isNotVisible('Add to Dashboard button is not visible when feature flag is off');

    config.navi.FEATURES = originalFeatures;
  });

  test('Switch Visualization Type', async function(assert) {
    assert.expect(7);

    await visit('/reports/1/view');

    assert.ok(!!findAll('.line-chart-widget').length, 'Line chart visualization is shown as configured');

    assert.dom('.report-view__visualization-edit-btn').hasText('Edit Line Chart', 'Edit Line Chart label is displayed');

    assert.dom('.c3-legend-item').exists({ count: 3 }, 'Line chart visualization has 3 series as configured');

    await click('.visualization-toggle__option[title="Data Table"]');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is shown when selected');

    assert.dom('.report-view__visualization-edit-btn').hasText('Edit Table', 'Edit Data Table label is displayed');

    await click('.visualization-toggle__option[title="Line Chart"]');

    assert.ok(!!findAll('.line-chart-widget').length, 'line-chart visualization is shown when selected');

    assert.dom('.report-view__visualization-edit-btn').hasText('Edit Line Chart', 'Edit Line Chart label is displayed');
  });

  test('redirect from report/index route', async function(assert) {
    assert.expect(2);

    await visit('/reports/1');

    assert.equal(
      currentURL(),
      '/reports/1/view',
      'The url of the index route is replaced with the url of the view route'
    );

    assert
      .dom('.navi-report__body .report-view')
      .isVisible('The report/index route redirects to the reports view route by default');
  });

  test('visiting Reports Route', async function(assert) {
    assert.expect(1);

    await visit('/reports');

    let titles = findAll('.navi-collection .table tr td:first-of-type').map(el => find(el).innerText.trim());

    assert.deepEqual(
      titles,
      ['Hyrule News', 'Hyrule Ad&Nav Clicks', 'Report 12'],
      'the report list with `navi-users`s reports is shown'
    );
  });

  test('reports route actions -- clone', async function(assert) {
    assert.expect(2);

    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    // Click "Clone"
    await click('.navi-collection__row0 .clone');

    assert.ok(
      TempIdRegex.test(currentURL()),
      'After cloning, user is brought to view route for a new report with a temp id'
    );

    assert.dom('.navi-report__title').hasText('Copy of Hyrule News', 'Cloned report is being viewed');
  });

  test('reports route actions -- share', async function(assert) {
    assert.expect(1);

    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    // Click "Share"
    await click('.navi-collection__row0 .share .btn');

    assert.dom('.primary-header').hasText('Share "Hyrule News"', 'Share modal pops up when action is clicked');

    // Click "Cancel"
    await click('.navi-modal .btn-secondary');
  });

  test('reports route actions -- delete', async function(assert) {
    assert.expect(3);

    await visit('/reports');

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    // Click "Delete"
    await click('.navi-collection__row0 .delete button');

    assert.dom('.primary-header').hasText('Delete "Hyrule News"', 'Delete modal pops up when action is clicked');

    //Click "Confirm"
    await click('.navi-modal .btn-primary');

    assert.ok(currentURL().endsWith('/reports'), 'After deleting, user is brought to report list view');

    let reportNames = findAll('.table tbody td:first-child').map(el => el.innerText.trim());

    assert.deepEqual(reportNames, ['Hyrule Ad&Nav Clicks', 'Report 12'], 'Deleted report is removed from list');
  });

  test('Visiting Reports Route From Breadcrumb', async function(assert) {
    assert.expect(1);

    await visit('/reports/1/view');

    //Click "Reports"
    await click('.navi-report__breadcrumb-link');

    assert.ok(
      currentURL().endsWith('/reports'),
      'When "Directory" clicked on the Breadcrumb link, it lands to "my-data" page'
    );
  });

  test('Revert report changes when exiting from route', async function(assert) {
    assert.expect(2);

    await visit('/reports/4/view');

    assert.ok(
      !!$('.filter-builder__subject:contains(Day)').length,
      'After navigating out of the route, the report model is rolled back'
    );

    await clickItem('timeGrain', 'Week');

    //Navigate out of report
    await click('.navi-report__breadcrumb-link');

    //Navigate back to `Report 12`
    await visit('/reports/4/view');

    assert.ok(
      !!$('.filter-builder__subject:contains(Day)').length,
      'After navigating out of the route, the report model is rolled back'
    );
  });

  test('Revert Visualization Type - Back to Original Type', async function(assert) {
    assert.expect(3);

    /* == Load report == */
    await visit('/reports/1/view');

    assert.ok(!!findAll('.line-chart-widget').length, 'Line chart visualization is shown as configured');

    /* == Switch to table == */
    await click('.visualization-toggle__option[title="Data Table"]');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is shown when selected');

    /* == Revert == */
    await click('.navi-report__revert-btn');

    assert.ok(!!findAll('.line-chart-widget').length, 'line-chart visualization is shown when reverted');
  });

  test('Revert Visualization Type - Updated Report', async function(assert) {
    assert.expect(5);

    /* == Load report == */
    await visit('/reports/1/view');

    assert.ok(!!findAll('.line-chart-widget').length, 'Line chart visualization is shown as configured');

    /* == Switch to table == */
    await click('.visualization-toggle__option[title="Data Table"]');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is shown when selected');

    /* == Save report == */
    await click('.navi-report__save-btn');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is still shown when saved');

    /* == Switch to chart == */
    await click('.visualization-toggle__option[title="Line Chart"]');

    assert.ok(!!findAll('.line-chart-widget').length, 'line-chart visualization is shown when selected');

    /* == Revert == */
    await click('.navi-report__revert-btn');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is shown when reverted');
  });

  test('Revert Visualization Type - New Report', async function(assert) {
    assert.expect(4);

    /* == Create report == */
    await visit('/reports');
    await visit('/reports/new');
    await clickItem('metric', 'Ad Clicks');
    await click('.navi-report__run-btn');

    assert.ok(!!findAll('.table-widget').length, 'Table visualization is shown by default');

    /* == Save report == */
    await click('.navi-report__save-btn');

    assert.ok(!!findAll('.table-widget').length, 'Table visualization is still shown when saved');

    /* == Switch to metric label == */
    await click('.visualization-toggle__option[title="Metric Label"]');

    assert.ok(!!findAll('.metric-label-vis').length, 'Metric label visualization is shown when selected');

    /* == Revert == */
    await click('.navi-report__revert-btn');

    assert.ok(!!findAll('.table-widget').length, 'table visualization is shown when reverted');
  });

  test('Toggle Edit Visualization', async function(assert) {
    assert.expect(3);

    /* == Visit report == */
    await visit('/reports/1/view');

    /* == Verify visualization config is not shown == */

    assert
      .dom('.report-view__visualization-edit')
      .doesNotExist('visualization config is closed on initial report load');

    /* == Open config == */
    await click('.report-view__visualization-edit-btn');
    await animationsSettled();

    assert.dom('.report-view__visualization-edit').exists('visualization config is opened after clicking edit button');

    /* == Close config == */
    await click('.report-view__visualization-edit-btn');
    await animationsSettled();

    assert
      .dom('.report-view__visualization-edit')
      .doesNotExist('visualization config is closed after clicking edit button');
  });

  test('Disabled Visualization Edit', async function(assert) {
    assert.expect(4);

    // Visit report and make a change that invalidates visualization
    await visit('/reports/1/view');
    await clickItem('dimension', 'Product Family');
    await animationsSettled();

    assert.dom('.report-view__visualization-edit-btn').isNotVisible('Edit visualization button is no longer visible');

    assert
      .dom('.report-view__info-text')
      .hasText('Run request to update Line Chart', 'Notification to run request is visible');

    // Run report
    await click('.navi-report__run-btn');
    await animationsSettled();

    assert
      .dom('.report-view__visualization-edit-btn')
      .isVisible('After running, edit visualization button is once again visible');

    assert.dom('.report-view__info-text').isNotVisible('After running, notification to run is no longer visible');
  });

  test('Disabled Visualization Edit While Editing', async function(assert) {
    assert.expect(9);

    await visit('/reports/2/view');
    await click('.report-view__visualization-edit-btn');
    await animationsSettled();

    assert
      .dom('.report-view__visualization-edit')
      .isVisible('Visualization edit panel is visible after clicking the edit button');

    // Make a change that does NOT invalidate visualization
    await fillIn('.table-header-cell.dateTime input', 'Foo');
    await blur('.table-header-cell.dateTime input');
    assert
      .dom('.report-view__visualization-edit')
      .isVisible('Visualization edit panel is still visible after making changes that do not change the request');

    assert
      .dom('.report-view__visualization-edit-btn')
      .isVisible('Visualization edit button is is still visible after making changes that do not change the request');

    assert
      .dom('.report-view__info-text')
      .isNotVisible('Notification to run is not visible after making changes that do not change the request');

    // Make a change that invalidates visualization
    await clickItem('dimension', 'Product Family');
    await animationsSettled();

    assert
      .dom('.report-view__visualization-edit')
      .isNotVisible('Visualization edit panel is hidden when there are request changes that have not been run');

    assert
      .dom('.report-view__visualization-edit-btn')
      .isNotVisible('Visualization edit button is hidden when there are request changes that have not been run');

    assert
      .dom('.report-view__info-text')
      .isVisible('Notification to run is visible when there are request changes that have not been run');

    // Run report
    await click('.navi-report__run-btn');
    await animationsSettled();

    assert
      .dom('.report-view__visualization-edit-btn')
      .isVisible('Visualization edit button is back after running report');

    assert
      .dom('.report-view__info-text')
      .isNotVisible('Notification to run is visible when there are request changes that have not been run');
  });

  test('Save changes', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await clickItem('metric', 'Ad Clicks');

    assert
      .dom('.navi-report__save-btn')
      .isVisible('Save changes button is visible once a change has been made and when owner of report');

    await visit('/reports/3/view');
    await clickItem('metric', 'Ad Clicks');

    assert.dom('.navi-report__save-btn').isNotVisible('Save changes button is visible when not owner of a report');
  });

  test('Error route', async function(assert) {
    assert.expect(1);

    //suppress errors and exceptions for this test
    let originalLoggerError = Ember.Logger.error,
      originalException = Ember.Test.adapter.exception;

    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};

    await visit('/reports/invalidRoute');

    assert.equal(
      find('.report-not-found')
        .innerText.replace(/\s+/g, ' ')
        .trim(),
      'Oops! Something went wrong with this report. Try going back to where you were last or to the reports page.',
      'An error message is displayed for an invalid route'
    );

    Ember.Logger.error = originalLoggerError;
    Ember.Test.adapter.exception = originalException;
  });

  test('Updating chart series', async function(assert) {
    assert.expect(4);

    // Check inital series
    await visit('/reports/1/view');

    let seriesLabels = findAll('.c3-legend-item').map(el => el.textContent.trim());
    let hiddenLabels = findAll('.c3-legend-item-hidden').map(el => el.textContent.trim());
    assert.deepEqual(seriesLabels, ['Property 1', 'Property 2', 'Property 3'], '3 series are initially present');
    assert.deepEqual(hiddenLabels, [], 'No series are initially hidden from chart');

    // Toggle off first series
    await click('.c3-legend-item-Property-1');
    hiddenLabels = findAll('.c3-legend-item-hidden').map(el => el.textContent.trim());
    assert.deepEqual(hiddenLabels, ['Property 1'], 'Selected series has been hidden from chart');

    // Toggle on first series
    await click('.c3-legend-item-Property-1');
    hiddenLabels = findAll('.c3-legend-item-hidden').map(el => el.textContent.trim());
    assert.deepEqual(hiddenLabels, [], 'Property 1 is no longer hidden from chart');
  });

  test('favorite reports', async function(assert) {
    assert.expect(3);

    // Filter by favorites
    await visit('/reports');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    let listedReports = findAll('tbody tr td:first-of-type').map(el => el.innerText.trim());

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'Report 2 is in favorites section');

    // Favorite report 1
    await visit('/reports/1');
    await click('.favorite-item');

    // Filter by favorites
    await visit('/reports');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    listedReports = findAll('tbody tr td:first-of-type').map(el => el.innerText.trim());

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks', 'Hyrule News'], 'Two reports are in favorites now');

    // Unfavorite report 2
    await click($('tbody tr td a:contains(Hyrule Ad&Nav Clicks)')[0]);
    await click('.favorite-item');
    await visit('/reports');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    listedReports = findAll('tbody tr td:first-of-type').map(el => el.innerText.trim());

    assert.deepEqual(listedReports, ['Hyrule News'], 'Only one report is in favorites now');
  });

  test('favorite report - rollback on failure', async function(assert) {
    assert.expect(2);

    // Mock server path endpoint to mock failure
    server.urlPrefix = `${config.navi.appPersistence.uri}`;
    server.patch('/users/:id', () => new Response(500));

    // Filter by favorites
    await visit('/reports');
    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    let listedReports = findAll('tbody tr td:first-of-type').map(el => el.innerText.trim());

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'Report 2 is in favorites section');

    await visit('/reports/1');

    await click('.favorite-item');

    await visit('/reports');

    await selectChoose('.navi-collection__filter-trigger', 'Favorites');

    listedReports = findAll('tbody tr td:first-of-type').map(el => el.innerText.trim());

    assert.deepEqual(listedReports, ['Hyrule Ad&Nav Clicks'], 'The user state is rolled back on failure');
  });

  test('running report after reverting changes', async function(assert) {
    assert.expect(2);

    /* == Modify report by adding a metric == */
    await visit('/reports/1/view');
    await click('.visualization-toggle__option[title="Data Table"]');
    await clickItem('metric', 'Time Spent');
    await click('.navi-report__run-btn');

    assert.ok(
      !!$('.table-header-row-vc--view .table-header-cell:contains(Time Spent)').length,
      'Time Spent column is displayed'
    );

    /* == Revert report to its original state == */
    await clickItem('metric', 'Time Spent');
    await click('.navi-report__run-btn');

    assert.notOk(
      !!$('.table-header-row-vc--view .table-header-cell:contains(Time Spent)').length,
      'Time Spent column is not displayed'
    );
  });

  test('Running a report against unauthorized table shows unauthorized route', async function(assert) {
    assert.expect(5);
    await visit('/reports/1/view');

    await selectChoose('.navi-table-select__dropdown', 'Protected Table');

    await click('.navi-report__run-btn');

    assert.equal(currentURL(), '/reports/1/unauthorized', 'check to seee if we are on the unauthorized route');

    assert.ok(!!findAll('.navi-report-invalid__info-message .fa-lock').length, 'unauthorized component is loaded');

    await click('.navi-report__cancel-btn');
    await selectChoose('.navi-table-select__dropdown', 'Network');
    await click('.navi-report__run-btn');
    await click('.visualization-toggle__option[title="Data Table"]');

    assert.equal(currentURL(), '/reports/1/view', 'check to seee if we are on the view route');

    assert.notOk(
      !!findAll('.navi-report-invalid__info-message .fa-lock').length,
      'unauthorized component is not loaded'
    );

    assert.ok(!!findAll('.table-widget').length, 'Data table visualization loads');
  });

  test("filtering on a dimension with a storage strategy of 'none'", async function(assert) {
    assert.expect(7);

    //Add filter for a dimension where storageStrategy is 'none' and try to run the report
    await visit('/reports/1/view');
    await clickItem('dimension', 'Context Id');
    await clickItemFilter('dimension', 'Context Id');
    await click('.navi-report__run-btn');

    assert
      .dom('.navi-info-message__error-list-item')
      .hasText(
        'Context Id filter needs at least one value',
        'Error message is shown when trying to run a report with an empty filter'
      );

    //Give the filter a value that will not match any dimension values
    await fillIn('.emberTagInput-new>input', 'This_will_not_match_any_dimension_values');
    await blur('.js-ember-tag-input-new');

    assert
      .dom('.navi-info-message__error-list-item')
      .isNotVisible('No errors are shown after giving a value to filter on');

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('/data/*path', (db, request) => {
      assert.equal(
        get(request, 'queryParams.filters'),
        'contextId|id-in["This_will_not_match_any_dimension_values"]',
        "Filter value is passed even when the value doesn'nt match any dimension IDs"
      );

      return { rows: [] };
    });

    //Run the report with the invalid dimension value to filter on
    await click('.navi-report__run-btn');

    assert
      .dom('.navi-report-invalid__info-message')
      .isNotVisible('The report is run even when no dimension values match the filter');

    //Give the filter an empty value
    await click('.emberTagInput-remove');
    await click('.navi-report__run-btn');

    assert.equal(
      find('.navi-info-message__error-list-item').innerText.trim(),
      'Context Id filter needs at least one value',
      'Error message is shown when trying to run a report with an empty filter value'
    );

    assert.dom('.filter-values--multi-value-input--error').isVisible('Filter value input validation errors are shown');

    await clickItem('dimension', 'Operating System');
    await clickItemFilter('dimension', 'Operating System');

    assert
      .dom('.filter-values--dimension-select__trigger')
      .isVisible("Dimension select is used when the dimension's storage strategy is not 'none'");
  });

  test('filter - add and remove using filter icon', async function(assert) {
    assert.expect(4);

    await visit('/reports/1');
    //add dimension filter
    await clickItemFilter('dimension', 'Operating System');

    assert.ok(
      !!$('.filter-builder__subject:contains(Operating System)'.length),
      'The Operating System dimension filter is added'
    );

    //remove filter by clicking on filter icon again
    await clickItemFilter('dimension', 'Operating System');

    assert.notOk(
      !!$('.filter-builder__subject:contains(Operating System)').length,
      'The Operating System dimension filter is removed when filter icon is clicked again'
    );

    //add metric filter
    await clickItemFilter('metric', 'Ad Clicks');

    assert.ok(!!$('.filter-builder__subject:contains(Ad Clicks)').length, 'The Ad Clicks metric filter is added');

    //remove metric filter by clicking on filter icon again
    await clickItemFilter('metric', 'Ad Clicks');

    assert.notOk(
      !!$('.filter-builder__subject:contains(Ad Clicks)').length,
      'The Ad Clicks metric filter is removed when filter icon is clicked again'
    );
  });

  test('filters - collapse and expand', async function(assert) {
    assert.expect(9);

    await visit('/reports/1');

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (1)');

    //expand filters
    await click('.filter-collection--collapsed');
    assert
      .dom('.filter-collection')
      .doesNotHaveClass('filter-collection--collapsed', 'Collapsed filters are expanded on click');

    //collapse again
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (2)');

    //add a dimension filter
    await clickItemFilter('dimension', 'Operating System');
    assert
      .dom('.filter-collection')
      .doesNotHaveClass('filter-collection--collapsed', 'Adding a dimension filter expands filters');

    //collapse again
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (3)');

    //remove the dimension filter
    await clickItemFilter('dimension', 'Operating System');
    assert
      .dom('.filter-collection')
      .hasClass('filter-collection--collapsed', 'Filters are still collapsed when removing a dimension filter');

    //add a metric filter
    await clickItemFilter('metric', 'Ad Clicks');
    assert
      .dom('.filter-collection')
      .doesNotHaveClass('filter-collection--collapsed', 'Adding a metric filter expands filters');

    //collapse again
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasClass('filter-collection--collapsed', 'Filters are collapsed (4)');

    //remove the metric filter
    await clickItemFilter('metric', 'Ad Clicks');
    assert
      .dom('.filter-collection')
      .hasClass('filter-collection--collapsed', 'Filters are still collapsed when removing a metric filter');
  });

  test('Dimension selector', async function(assert) {
    assert.expect(15);

    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;

    config.navi.FEATURES.enableRequestPreview = false;

    await visit('/reports/1');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Property'],
      'Selected dimensions and time grain initially include "Day" and "Property"'
    );

    let dimensionItem = await getItem('dimension', 'Operating System');

    assert.ok(dimensionItem.item.querySelector('.fa-plus-circle'), 'An unselected dimension row has a plus icon');

    // Add Dimension
    await clickItem('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Adding a dimension changes selected dimensions'
    );

    // Add selected dimension as filter
    await clickItemFilter('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Adding a selected dimension as filter does not change the selected items'
    );

    // Remove the selected dimension filter
    await clickItemFilter('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Removing a filter of a dimension already selected does not change selected items'
    );

    // Add unselected dimension as filter
    await clickItemFilter('dimension', 'Gender');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Adding an unselected dimension as filter does not change the selected items'
    );

    // Remove the unselected dimension filter
    await clickItemFilter('dimension', 'Gender');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Removing a filter of an unselected dimension does not change selected items'
    );

    // Remove Dimension
    await clickItem('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Property'],
      'Removing a dimension as a filter and dimension changes the selected items'
    );

    dimensionItem = await getItem('dimension', 'Operating System');

    assert.ok(dimensionItem.item.querySelector('.fa-plus-circle'), 'Removed dimension row has a plus icon again');

    config.navi.FEATURES.enableRequestPreview = true;

    await visit('/reports/1');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Property'],
      'Selected dimensions and time grain initially include "Day" and "Property"'
    );

    dimensionItem = await getItem('dimension', 'Operating System');

    assert.ok(
      dimensionItem.item.querySelector('.fa-plus-circle'),
      'An unselected dimension row has a plus icon (enableRequestPreview on)'
    );

    // Add Dimension
    await clickItem('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Adding a dimension changes selected dimensions (enableRequestPreview on)'
    );

    dimensionItem = await getItem('dimension', 'Operating System');

    assert.ok(
      dimensionItem.item.querySelector('.fa-plus-circle'),
      'Added dimension row still has a plus icon (enableRequestPreview on)'
    );

    // Click dimension again
    await clickItem('dimension', 'Operating System');

    assert.deepEqual(
      await getAllSelected('dimension'),
      ['Day', 'Operating System', 'Property'],
      'Clicking a selected dimension does not change selected dimensions (enableRequestPreview on)'
    );

    dimensionItem = await getItem('dimension', 'Operating System');

    assert.ok(
      dimensionItem.item.querySelector('.fa-plus-circle'),
      'Dimension row still has a plus icon (enableRequestPreview on)'
    );

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });

  test('Metric selector', async function(assert) {
    assert.expect(14);

    const originalFeatureFlag = config.navi.FEATURES.enableRequestPreview;

    config.navi.FEATURES.enableRequestPreview = false;

    await visit('/reports/1');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks'],
      'Selected metrics initally include "Ad Clicks" and "Nav Link Clicks"'
    );

    let metricItem = await getItem('metric', 'Total Clicks');

    assert.ok(metricItem.item.querySelector('.fa-plus-circle'), 'An unselected metric row has a plus icon');

    // Add Metric
    await clickItem('metric', 'Total Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Adding a metric changes selected metrics'
    );

    // Add selected metric as filter
    await clickItemFilter('metric', 'Total Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Adding a selected metric as filter does not change the selected items'
    );

    // Remove the selected metric filter
    await clickItemFilter('metric', 'Total Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Removing a filter of a metric already selected does not change selected items'
    );

    // Add unselected metric as filter
    await clickItemFilter('metric', 'Other Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Other Clicks', 'Total Clicks'],
      'Adding an unselected metric as filter selects the metric'
    );

    // Remove Metrics
    await clickItem('metric', 'Total Clicks');
    await clickItem('metric', 'Other Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks'],
      'Removing a metric changes selected metrics'
    );

    metricItem = await getItem('metric', 'Total Clicks');

    assert.ok(metricItem.item.querySelector('.fa-plus-circle'), 'Removed metric row has a plus icon again');

    config.navi.FEATURES.enableRequestPreview = true;

    await visit('/reports/1');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks'],
      'Selected metrics initally include "Ad Clicks" and "Nav Link Clicks"'
    );

    metricItem = await getItem('metric', 'Total Clicks');

    assert.ok(
      metricItem.item.querySelector('.fa-plus-circle'),
      'An unselected metric row has a plus icon (enableRequestPreview on)'
    );

    // Add Metric
    await clickItem('metric', 'Total Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Adding a metric changes selected metrics (enableRequestPreview on)'
    );

    metricItem = await getItem('metric', 'Total Clicks');

    assert.ok(
      metricItem.item.querySelector('.fa-plus-circle'),
      'Added metric row still has a plus icon (enableRequestPreview on)'
    );

    // Click metric again
    await clickItem('metric', 'Total Clicks');

    assert.deepEqual(
      await getAllSelected('metric'),
      ['Ad Clicks', 'Nav Link Clicks', 'Total Clicks'],
      'Clicking a selected metric does not change selected metrics (enableRequestPreview on)'
    );

    metricItem = await getItem('metric', 'Total Clicks');

    assert.ok(
      metricItem.item.querySelector('.fa-plus-circle'),
      'Metric row still has a plus icon (enableRequestPreview on)'
    );

    config.navi.FEATURES.enableRequestPreview = originalFeatureFlag;
  });

  test('Test filter "Is Empty" is accepted', async function(assert) {
    assert.expect(2);
    await visit('/reports/1');

    await clickItemFilter('dimension', 'Operating System');
    await selectChoose('.filter-collection__row:last-of-type .filter-builder-dimension__operator', 'Is Empty');
    await click('.navi-report__run-btn');

    assert.ok(
      !!findAll('.line-chart-widget').length,
      'line-chart visualization is shown instead of validation error when Is Empty is picked'
    );

    assert.dom('.navi-info-message__error-list-item').isNotVisible('Should not show empty values error');
  });

  test('Test filter "Is Not Empty" is accepted', async function(assert) {
    assert.expect(2);
    await visit('/reports/1');

    await clickItemFilter('dimension', 'Operating System');
    await selectChoose('.filter-collection__row:last-of-type .filter-builder-dimension__operator', 'Is Not Empty');
    await click('.navi-report__run-btn');

    assert.ok(
      !!findAll('.line-chart-widget').length,
      'line-chart visualization is shown instead of validation error when Is Not Empty is  picked'
    );

    assert.dom('.navi-info-message__error-list-item').isNotVisible('Should not show empty values error');
  });

  test("Date Picker doesn't change date when moving to time grain where dates are valid", async function(assert) {
    assert.expect(6);

    await visit('/reports/1');
    await clickItem('timeGrain', 'Month');

    // Select the month Jan
    await clickTrigger('.filter-values--date-range-input__low-value');
    await click($('.ember-power-calendar-selector-month:contains(Jan)')[0]);
    await clickTrigger('.filter-values--date-range-input__high-value');
    await click($('.ember-power-calendar-selector-month:contains(Jan)')[0]);
    await click('.navi-report__run-btn');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Jan 2015', 'Start Month is changed to Jan 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('Jan 2015', 'End Month is changed to Jan 2015');

    await clickItem('timeGrain', 'Day');
    await click('.navi-report__run-btn');

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Jan 01, 2015', 'Switching to day time period preserves date to start of month');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Jan 31, 2015', 'Switching to day time period preserves date to end of month');

    await clickItem('timeGrain', 'Week');
    await click('.navi-report__run-btn');

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Dec 29, 2014', 'Switching to week casts the date to match the start of the date time period');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Jan 25, 2015', 'Switching to week casts the date to match the end of the date time period');
  });

  test('Date picker change interval type', async function(assert) {
    assert.expect(9);

    await visit('/reports/1');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Nov 09, 2015', 'The start date is Nov 09, 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('Nov 15, 2015', 'The end date is Nov 15, 2015');

    await selectChoose('.filter-builder__select-trigger', 'Advanced');
    assert.dom(findAll('.filter-values--advanced-interval-input__value')[0]).hasValue('P7D', 'The start date is P7D');
    assert
      .dom(findAll('.filter-values--advanced-interval-input__value')[1])
      .hasValue('2015-11-15', 'The end date is 2015-11-15');

    await selectChoose('.filter-builder__select-trigger', 'Between');
    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Nov 09, 2015', 'The start date is still Nov 09, 2015');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Nov 15, 2015', 'The end date is still Nov 15, 2015');

    await selectChoose('.filter-builder__select-trigger', 'Advanced');
    await fillIn(findAll('.filter-values--advanced-interval-input__value')[1], 'current');
    await blur(findAll('.filter-values--advanced-interval-input__value')[1]);
    assert
      .dom('.ember-power-select-selected-item')
      .hasText('In The Past', 'relative/current changes date to in the past');

    await selectChoose('.filter-builder__select-trigger', 'Since');
    const dateFormat = 'MMM DD, YYYY';
    assert.dom('.dropdown-date-picker__trigger').hasText(
      moment()
        .subtract(7, 'day')
        .format(dateFormat),
      'The start is 7 days ago'
    );

    await selectChoose('.filter-builder__select-trigger', 'Current Day');

    const today = moment().format(dateFormat);
    assert.dom('.filter-values--current-period').hasText(`The current day. (${today})`, 'The current day');
  });

  test('Date Picker start date beyond end date', async function(assert) {
    assert.expect(19);

    await visit('/reports/1');
    await selectChoose('.filter-builder__select-trigger', 'Between');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Nov 09, 2015', 'The start date is Nov 09, 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('Nov 15, 2015', 'The end date is Nov 15, 2015');

    //start date beyond end date
    await clickTrigger('.filter-values--date-range-input__low-value');
    await click('.ember-power-calendar-day[data-date="2015-11-18"]');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Nov 18, 2015', 'The start date is Nov 18, 2015');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Nov 15, 2015', 'The end date is still Nov 15, 2015');

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.filter-collection')
      .hasText('Date Time (Day) between Nov 18, 2015 - Nov 15, 2015', 'Collapsed range is Nov 18, 2015 - Nov 15, 2015');
    //expand filters
    await click('.filter-collection--collapsed');

    await click('.navi-report__run-btn');

    assert
      .dom('.navi-info-message__error-list')
      .hasText(
        'The start date should be before end date',
        '"The start date should be before end date" error is rendered'
      );

    //start date is equal to end date
    await clickTrigger('.filter-values--date-range-input__high-value');
    await click('.ember-power-calendar-day[data-date="2015-11-18"]');

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Nov 18, 2015', 'The start date is still Nov 18, 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('Nov 18, 2015', 'The end date is Nov 18, 2015');

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert.dom('.filter-collection').hasText('Date Time (Day) between Nov 18, 2015', 'Collapsed range is Nov 18, 2015');
    //expand filters
    await click('.filter-collection--collapsed');

    await click('.navi-report__run-btn');

    assert.dom('.navi-info-message__error-list').doesNotExist('No error if dates are equal');

    //start date 1 day beyond end date
    await clickTrigger('.filter-values--date-range-input__low-value');
    await click('.ember-power-calendar-day[data-date="2015-11-19"]');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Nov 19, 2015', 'The start date is Nov 19, 2015');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Nov 18, 2015', 'The end date is still Nov 18, 2015');

    //collapse filters
    await click('.report-builder__container-header__filters-toggle');
    assert
      .dom('.filter-collection')
      .hasText('Date Time (Day) between Nov 19, 2015 - Nov 18, 2015', 'Collapsed range is Nov 19, 2015 - Nov 18, 2015');
    //expand filters
    await click('.filter-collection--collapsed');

    await click('.navi-report__run-btn');

    assert
      .dom('.navi-info-message__error-list')
      .hasText(
        'The start date should be before end date',
        '"The start date should be before end date" error is rendered when start date is 1 day beyond end date'
      );

    //select month grain
    await clickItem('timeGrain', 'Month');

    assert.dom('.filter-values--date-range-input__low-value').hasText('Nov 2015', 'The start date is month Nov 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('Nov 2015', 'The end date is month Nov 2015');

    await click('.navi-report__run-btn');

    assert.dom('.navi-info-message__error-list').doesNotExist('No error if months are equal');

    await clickTrigger('.filter-values--date-range-input__low-value');
    await click($('.ember-power-calendar-selector-month:contains(Dec)')[0]);

    await click('.navi-report__run-btn');

    assert
      .dom('.navi-info-message__error-list')
      .hasText(
        'The start date should be before end date',
        '"The start date should be before end date" error is rendered when start month is 1 month beyond end month'
      );

    await clickTrigger('.filter-values--date-range-input__high-value');
    await click($('.ember-power-calendar-selector-month:contains(Dec)')[0]);

    await click('.navi-report__run-btn');

    assert.dom('.navi-info-message__error-list').doesNotExist('No error if months are equal');
  });

  test('Date picker all timegrain', async function(assert) {
    assert.expect(5);

    await visit('/reports/1');

    // select month grain
    await clickItem('timeGrain', 'Month');

    await clickTrigger('.filter-values--date-range-input__low-value');
    await click($('.ember-power-calendar-selector-month:contains(Jan)')[0]);

    await clickTrigger('.filter-values--date-range-input__high-value');
    await click($('.ember-power-calendar-selector-month:contains(May)')[0]);

    assert.dom('.filter-values--date-range-input__low-value').hasText('Jan 2015', 'The start date is month Jan 2015');
    assert.dom('.filter-values--date-range-input__high-value').hasText('May 2015', 'The end date is month May 2015');

    // select 'all' grain
    await clickItem('timeGrain', 'Month');

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Jan 01, 2015', 'The start date is beginning of Jan, 2015');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('May 31, 2015', 'The end date is end of May, 2015');

    await clickTrigger('.filter-values--date-range-input__high-value');
    await click('.ember-power-calendar-day[data-date="2015-05-30"]');
    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('May 30, 2015', 'Calendar defaults "all" grain  to show the lowest grain which is day');
  });

  test("Report with an unknown table doesn't crash", async function(assert) {
    assert.expect(1);
    await visit('/reports/9');

    assert
      .dom('.navi-info-message__error-list-item')
      .hasText(
        'Table is invalid or unavailable',
        'Should show an error message when table cannot be found in metadata'
      );
  });

  test('Filter with large cardinality dimensions value selection works', async function(assert) {
    assert.expect(2);
    let option,
      dropdownSelector = '.filter-values--dimension-select__trigger';
    await visit('/reports/new');

    // Load table A as it has the large cardinality dimensions, and choose a large cardinality dimension

    await selectChoose('.navi-table-select__dropdown', 'Table A');
    await clickItem('dimension', 'EventId');
    await clickItem('metric', 'Network Sessions');
    await click($('.navi-report__footer button:Contains(Run)')[0]);

    // Grab one of the dim names after running a report
    option = find('.table-cell-content.dimension').textContent.trim();
    await clickItemFilter('dimension', 'EventId');

    // Open the dimension values so we can get values as they are dynamically created by mirage
    await clickTrigger(dropdownSelector);

    assert
      .dom('.filter-values--dimension-select__dropdown .ember-power-select-option--search-message')
      .hasText('Type to search', 'Message is correct');

    // Simulate typing a search which pulls large cardinality dimension values from the server
    await selectSearch(dropdownSelector, option.toLowerCase().substring(0, 3));
    await click($('.filter-values--dimension-select__dropdown .ember-power-select-option:contains(' + option + ')')[0]);

    // Check if the selected item is still selected after the search
    assert.ok(
      $(`.filter-values--dimension-select__dropdown .ember-power-select-option:contains(${option})`)[0].hasAttribute(
        'aria-selected'
      ),
      'The value is selected after a search is done'
    );
  });

  test('dimension contains filter works by letting users select field', async function(assert) {
    await visit('/reports/new');
    await clickItemFilter('dimension', 'Multi System Id');

    assert.dom('.filter-builder-dimension__operator').exists('Operator dropdown should exist for the dimension');
    assert.dom('.filter-builder-dimension__field').doesNotExist('field dropdown does not exist');

    await click('.filter-builder-dimension__operator .filter-builder-dimension__select-trigger');
    await click($('.filter-builder-dimension__operator-dropdown .ember-power-select-option:contains(Contains)')[0]);

    assert.dom('.filter-builder-dimension__field').isVisible('field dropdown is now showing');
    assert.dom('.filter-builder-dimension__field').hasText('key', 'field shows key');

    await click('.filter-builder-dimension__field .filter-builder-dimension__select-trigger');
    await click($('.filter-builder-dimension__field-dropdown .ember-power-select-option:contains(desc)')[0]);

    assert.dom('.filter-builder-dimension__field').hasText('desc', 'field shows desc');

    await click('.filter-builder-dimension__operator .filter-builder-dimension__select-trigger');
    await click($('.filter-builder-dimension__operator-dropdown .ember-power-select-option:contains(Equals)')[0]);

    assert.dom('.filter-builder-dimension__field').doesNotExist('field dropdown does not exist');

    await click('.filter-builder-dimension__operator .filter-builder-dimension__select-trigger');
    await click($('.filter-builder-dimension__operator-dropdown .ember-power-select-option:contains(Contains)')[0]);

    assert.dom('.filter-builder-dimension__field').hasText('key', 'field shows key after switching back');

    await click('.filter-builder-dimension__field .filter-builder-dimension__select-trigger');
    await click($('.filter-builder-dimension__field-dropdown .ember-power-select-option:contains(desc)')[0]);

    await fillIn('.filter-builder-dimension__values input', 'foo');
    await blur('.filter-builder-dimension__values input');

    await click('.get-api__btn');

    assert.ok(
      decodeURIComponent(find('.navi-modal__input').value).includes('multiSystemId|desc-contains["foo"]'),
      'Generated API URL is correct'
    );
  });

  test('dimension select filter works with dimension ids containing commas', async function(assert) {
    await visit('/reports/new');
    await clickItemFilter('dimension', 'Dimension with comma');

    await selectChoose('.filter-values--dimension-select__trigger', 'no');
    await selectChoose('.filter-values--dimension-select__trigger', 'yes');

    assert.deepEqual(
      findAll('.ember-power-select-multiple-option span:not(.ember-power-select-multiple-remove-btn)').map(el =>
        el.textContent.trim()
      ),
      ['no comma', 'yes, comma'],
      'The selected dimensions are shown even with a comma'
    );

    await click('.navi-report__run-btn');
    await click('.get-api__btn');

    const url = find('.navi-modal__input').value;
    const expectedFilter = 'commaDim|id-in["no comma","yes, comma"]';
    assert.ok(
      decodeURIComponent(url).includes(expectedFilter),
      `Generated API URL, ${url} is contains filter ${expectedFilter}`
    );
  });

  test('adding metrics to reordered table keeps order', async function(assert) {
    assert.expect(2);
    await visit('/reports/2');

    await reorder(
      'mouse',
      '.table-header-row-vc--view .table-header-cell',
      '.table-header-row-vc--view .metric:contains(Nav Clicks)',
      '.table-header-row-vc--view .dimension:contains(Property)',
      '.table-header-row-vc--view .metric:contains(Ad Clicks)',
      '.table-header-row-vc--view .dateTime'
    );

    assert.deepEqual(
      findAll('.table-header-row-vc--view .table-header-cell__title').map(el => el.innerText.trim()),
      ['Nav Clicks', 'Property', 'Ad Clicks', 'Date'],
      'The headers are reordered as specified by the reorder'
    );

    await clickItem('metric', 'Total Clicks');
    await click('.navi-report__run-btn');

    assert.deepEqual(
      findAll('.table-header-row-vc--view .table-header-cell__title').map(el => el.textContent.trim()),
      ['Nav Clicks', 'Property', 'Ad Clicks', 'Date', 'Total Clicks'],
      'The headers are reordered as specified by the reorder'
    );
  });

  test('Parameterized metrics with default displayname are not considered custom', async function(assert) {
    assert.expect(2);
    await visit('/reports/8');

    assert
      .dom('.table-header-row-vc--view .table-header-cell.metric > .table-header-cell__title')
      .isVisible('renders metric columns');
    assert
      .dom('.table-header-row-vc--view .table-header-cell.metric > .table-header-cell__title')
      .doesNotHaveClass(
        '.table-header-cell__title--custom-name',
        'Parameterized metrics with default display name should not be considered custom'
      );
  });

  test('Cancel Report', async function(assert) {
    assert.expect(14);

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get(
      'data/*path',
      () => {
        return { rows: [] };
      },
      { timing: 400 } //Slow down mock
    );

    // Load the report without waiting for it to finish loading
    visit('/reports/1').catch(error => {
      //https://github.com/emberjs/ember-test-helpers/issues/332
      const { message } = error;
      if (message !== 'TransitionAborted') {
        throw error;
      }
    });

    await waitFor('.navi-report__cancel-btn', { timeout: 5000 });

    let buttons = findAll('.navi-report__footer .navi-button');
    assert.dom('.navi-loader__spinner').isVisible('Report is loading');

    assert.deepEqual(
      buttons.map(e => e.textContent.trim()),
      ['Cancel'],
      'When report is loading, the only footer button is `Cancel`'
    );

    assert
      .dom('.report-builder__dimension-selector.report-builder__container--disabled')
      .isVisible('Dimension selector is disabled during run');
    assert
      .dom('.report-builder__metric-selector.report-builder__container--disabled')
      .isVisible('Metric selector is disabled during run');
    assert
      .dom('.report-builder__container--table.report-builder__container--disabled')
      .isVisible('Table selector is disabled during run');
    assert
      .dom('.report-builder__container--filters.report-builder__container--disabled')
      .isVisible('Filter collection is disabled during run');

    /* ================= Cancel Report ================= */
    await click($('.navi-report__cancel-btn')[0]);

    assert.equal(currentURL(), '/reports/1/edit', 'Clicking `Cancel` brings the user to the edit route');

    assert.deepEqual(
      findAll('.navi-report__footer .navi-button').map(e => e.textContent.trim()),
      ['Run'],
      'When not loading a report, the standard footer buttons are available'
    );

    //Run the report
    await click('.navi-report__run-btn');
    assert.equal(currentURL(), '/reports/1/view', 'Running the report brings the user to the view route');

    assert.deepEqual(
      findAll('.navi-report__footer .navi-button').map(e => e.textContent.trim()),
      ['Run'],
      'When not loading a report, the standard footer buttons are available'
    );

    assert
      .dom('.report-builder__dimension-selector')
      .doesNotHaveClass('report-builder__container--disabled', 'Dimension selector is enabled after run');
    assert
      .dom('.report-builder__metric-selector')
      .doesNotHaveClass('report-builder__container--disabled', 'Metric selector is enabled after run');
    assert
      .dom('.report-builder__container--table')
      .doesNotHaveClass('report-builder__container--disabled', 'Table selector is enabled after run');
    assert
      .dom('.report-builder__container--filters')
      .doesNotHaveClass('report-builder__container--disabled', 'Filter collection is enabled after run');
  });

  test('Recreating same report after revert runs', async function(assert) {
    await visit('/reports/2/view');

    const columns = () => findAll('.table-widget__table-headers .table-header-cell').map(el => el.textContent.trim());
    assert.deepEqual(columns(), ['Date', 'Property', 'Ad Clicks', 'Nav Clicks'], 'Report loads with expected columns');

    await clickItem('metric', 'Page Views');
    await click('.navi-report__run-btn');
    assert.deepEqual(
      columns(),
      ['Date', 'Property', 'Ad Clicks', 'Nav Clicks', 'Page Views'],
      'Report changed and ran successfully'
    );

    await click('.navi-report__revert-btn');
    assert.deepEqual(columns(), ['Date', 'Property', 'Ad Clicks', 'Nav Clicks'], 'Report revertted successfully');

    //make same changes and make sure it's runnable
    await clickItem('metric', 'Page Views');
    await click('.navi-report__run-btn');
    assert.deepEqual(
      columns(),
      ['Date', 'Property', 'Ad Clicks', 'Nav Clicks', 'Page Views'],
      'Report changed and ran successfully'
    );
  });

  test('Table number formatting works', async function(assert) {
    assert.expect(4);
    await visit('/reports/2/view');

    await click('.visualization-toggle__option[title="Data Table"]');
    await click('.report-view__visualization-edit-btn');

    await click(findAll('.number-format-dropdown__trigger')[1]); // open nav clicks dropdown

    const navClicksCell = () => find('.table-row-vc').querySelectorAll('.table-cell-content.metric')[1];
    assert.dom(navClicksCell()).hasText('718', 'The original metric value has no formatting');
    assert.dom('.number-format-selector__radio-custom input').isChecked('The custom input is selected');

    find('.number-format-selector__radio-money input').checked = true; // change format to money
    await triggerEvent('.number-format-selector__radio-money input', 'change');

    assert.dom('.number-format-selector__radio-money input').isChecked('The money input is selected');

    await click('.number-format-dropdown');
    assert.dom(navClicksCell()).hasText('$718', 'The metric is re-rendered in the money format');
  });
});
