import Ember from 'ember';
import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import Mirage from 'ember-cli-mirage';
import { fillInSync } from '../../../helpers/fill-in-sync';
import Interval from 'navi-core/utils/classes/interval';
import wait from 'ember-test-helpers/wait';

const { getOwner } = Ember;

let Template;

moduleForComponent('save-report', 'Integration | Component | report actions - Save', {
  integration: true,

  beforeEach() {
    Template = hbsWithModal(
      `{{#report-actions/save
                report=report
                naviNotifications=notifications
                _router=_router
            }}
                {{#if report.isNew}}
                    Save
                {{else}}
                    Save Changes
                {{/if}}
            {{/report-actions/save}}`,
      getOwner(this)
    );

    let store  = getOwner(this).lookup('service:store');

    setupMock();

    let metadataService = getOwner(this).lookup('service:bard-metadata');

    metadataService.loadMetadata().then(() => {
      Ember.run(() => {
        //set report object
        this.set('report', store.createRecord('report', {
          author: store.createRecord('user', {id: 'navi_user'}),
          request: store.createFragment('bard-request/request', {
            logicalTable: store.createFragment('bard-request/fragments/logicalTable', {
              table: metadataService.getById('table', 'network'),
              timeGrainName: 'day'
            }),
            intervals: [
              store.createFragment('bard-request/fragments/interval', {
                interval: new Interval(
                  moment('10-02-2015', 'MM-DD-YYYY'),
                  moment('10-14-2015', 'MM-DD-YYYY')
                )
              })
            ],
            metrics: [
              store.createFragment('bard-request/fragments/metric', {
                metric: metadataService.getById('metric', 'adClicks')
              })
            ],
            responseFormat: 'csv'
          })
        }));
      });
    });

    // Mock notifications
    this.notifications = {
      add: Ember.K
    };

    // Mock _router
    this._router = {
      transitionTo: Ember.K
    };
  },
  afterEach() {
    teardownMock();
  }
});

test('save report Component renders - when a new record is created', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    this.render(Template);

    assert.equal(this.$('.save-report').text().trim(),
      'Save',
      `Save is rendered when a new report record is created`);
  });
});

test('save report Component renders - when a loaded record is updated', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    Ember.run(() => {
      this.get('report').transitionTo('loaded');
    });

    this.render(Template);

    assert.equal(this.$('.save-report').text().trim(),
      'Save Changes',
      `Save changes is rendered when the loaded record is updated`);
  });
});

test('save report Component is not rendered - when there are no changes to save in the loaded record', function(assert) {
  assert.expect(1);

  return wait().then(() => {
    Ember.run(() => {
      /*
       * Updating the status of the ember data record
       * report.isNew = false && report.hasDirtyAttributes = false
       */
      this.get('report.request').transitionTo('loaded');
    });

    this.render(Template);

    assert.equal(this.$('.save-report').css('display'),
      'none',
      'Save report component is not rendered when there are no changes to save in the loaded record');
  });
});

test('save report modal', function(assert) {
  assert.expect(6);

  return wait().then(() => {
    this.render(Template);

    assert.equal(this.$('.ember-modal-dialog').length,
      0,
      'Save report modal is not rendered before clicking save report link');

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {
      assert.equal(this.$('.ember-modal-dialog').length,
        1,
        'Save report modal is rendered after clicking save report link');

      assert.equal(this.$('.primary-header').text().trim(),
        'Save',
        'modal has primary header containing text "Save"');

      assert.equal(this.$('.secondary-header').text().trim(),
        'Please provide a name for this report',
        'modal has secondary header containing text "Please provide a name for this report"');

      assert.equal(this.$('input.text-input').val().trim(),
        'Untitled Report',
        'modal contains a text input field with value "Untitled Report"');

      let buttons = this.$('.btn-container button');
      assert.deepEqual(buttons.map(function () {
        return this.textContent.trim();
      }).get(),
      ['Save', 'Cancel'],
      'Save and Cancel buttons are rendered as expected');
    });
  });
});


test("behavior of modal's cancel button", function(assert) {
  assert.expect(5);

  return wait().then(() => {
    this.render(Template);

    assert.equal(this.$('.ember-modal-dialog').length,
      0,
      'Save report modal is not rendered before clicking save report link');

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {
      assert.equal(this.$('.ember-modal-dialog').length,
        1,
        'Save report modal is rendered after clicking save report link');

      //Click Cancel
      this.$('.btn-container button:contains(Cancel)').click();

      assert.equal(this.$('.ember-modal-dialog').length,
        0,
        'Save report modal is closed after clicking cancel button');

      // Click save report link
      this.$('.save-report').click();

      return wait().then(()=> {

        assert.notOk(this.$('.btn-container button:contains(Cancel)').is(":disabled"),
          'Cancel button is not disabled before saving a report');

        // Save Report
        this.$('.btn-container button:contains(Save)').click();

        assert.ok(this.$('.btn-container button:contains(Cancel)').is(":disabled"),
          'Cancel button is disabled while saving a report');
      });
    });
  });
});

test("behavior of modal's save button", function(assert) {
  assert.expect(2);

  return wait().then(() => {
    this.render(Template);

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {

      assert.notOk(this.$('.btn-container button:contains(Save)').is(":disabled"),
        'Save report is not disabled when input field has text');

      // Clear report name
      Ember.run(() => {
        fillInSync('.text-input', '');
        this.$('.text-input').focusout();
      });

      assert.ok(this.$('.btn-container button:contains(Save)').is(":disabled"),
        'Save report is disabled when text input has no text');
    });
  });
});

test('behavior of loading spinner', function(assert) {
  assert.expect(2);

  return wait().then(() => {
    this.render(Template);

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {

      assert.equal(this.$('.loading-message').length,
        0,
        'loading spinner is not visible before clicking save report link');

      //Click Save Report
      this.$('.btn-container button:contains(Save)').click();

      assert.equal(this.$('.loading-message').length,
        1,
        'loading spinner is visible after clicking save report link');
    });
  });
});

test('behavior of character count label', function(assert) {
  assert.expect(3);

  return wait().then(() => {
    this.render(Template);

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {

      assert.equal(this.$('.char-count').text().trim(),
        '135 characters left',
        'Report name has 135 characters left initially');

      // Add new report name
      Ember.run(() => {
        fillInSync('.text-input', 'My Awsome Report');
      });

      assert.equal(this.$('.char-count').text().trim(),
        '134 characters left',
        'Report name has 134 characters left after entering new report name');

      // Clear report name
      Ember.run(() => {
        fillInSync('.text-input', '');
      });

      assert.equal(this.$('.char-count').text().trim(),
        '150 characters left',
        'Report name has 150 characters left when report name field is empty');
    });
  });
});

test('Save Report modal displays report name if it exists', function(assert){
  assert.expect(1);
  return wait().then(() => {
    this.render(Template);
    this.set('report.title', 'Test Title');
    // Click save report link
    this.$('.save-report').click();

    return wait().then(() => {
      assert.equal(this.$('input.text-input').val().trim(),
        'Test Title',
        'The modal uses the report title when defined as the input value');
    });
  });
});

test('saving invalid report throws notification', function(assert){
  assert.expect(2);

  return wait().then(() => {
    // Mock notifications
    this.set('notifications.add', (notification) => {
      assert.equal(notification.type,
        'danger',
        'Error notification is shown after clicking save report');

      assert.equal(notification.message,
        'OOPS! There is an problem with your request. Please fix all errors before saving.',
        'Notification message contains expected text');
    });

    let report = this.get('report');
    report.set('request.metrics', []);

    return wait().then(() => {
      this.render(Template);

      // Click save report link
      this.$('.save-report').click();
    });
  });
});

test('handling errors while saving a report', function(assert) {
  assert.expect(2);

  // Mock server POST endpoint to throw error
  server.post('/reports', () => {
    return new Mirage.Response(500);
  });

  // Mock notifications
  this.set('notifications.add', (notification) => {
    assert.equal(notification.type,
      'danger',
      'Error notification is shown after clicking save report');

    assert.equal(notification.message,
      'OOPS! An error occurred while saving the report',
      'Notification message contains expected text');
  });

  return wait().then(() => {
    this.render(Template);

    // Click save report link
    this.$('.save-report').click();

    return wait().then(()=> {

      //Click Save Report
      this.$('.btn-container button:contains(Save)').click();
    });
  });
});

test('saving report successfully', function(assert) {
  assert.expect(7);

  // Mock notifications
  this.set('notifications.add', (notification) => {
    assert.equal(notification.type,
      'success',
      'Success notification is shown after saving a report successfully');

    assert.equal(notification.message,
      'Report was successfully saved!',
      'Notification message contains expected text');

    assert.notOk(this.get('report.hasDirtyAttributes'),
      'Report is saved after clicking "Save" button');
  });

  // Mock routes transitionTo
  this.set('_router.transitionTo', (routeName, reportId) => {
    assert.ok(true,
      'Saving report successfully triggers a route transition');

    assert.equal(routeName,
      'customReports.report',
      'Page is redirected to "customReports.report" route as expected');

    let mirageReportId = server.db.reports.length.toString();

    assert.equal(reportId,
      mirageReportId,
      `Newly saved report has id ${mirageReportId} as expected`);
  });

  return wait().then(() => {
    this.render(Template);

    // Click save report link
    this.$('.save-report').click();

    assert.ok(this.get('report.hasDirtyAttributes'),
      'Report is not saved before clicking Save Report button');

    return wait().then(()=> {
      //Click Save Report
      this.$('.btn-container button:contains(Save)').click();
    });
  });
});
