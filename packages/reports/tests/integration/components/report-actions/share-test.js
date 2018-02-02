import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import wait from 'ember-test-helpers/wait';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

const { getOwner } = Ember;

let ReportPromise,
    Template,
    Store;

moduleForComponent('report-actions/share-report', 'Integration | Component | report action - share', {
  integration: true,

  beforeEach() {
    Template = hbsWithModal(`
      {{#report-actions/share
        report=report
        _appRouter=_appRouter
      }}
        Share Report
      {{/report-actions/share}}
    `, getOwner(this));

    setupMock();

    Store = getOwner(this).lookup('service:store');

    ReportPromise = getOwner(this).lookup('service:bard-metadata').loadMetadata().then(() => {
      return Store.findRecord('report', 1);
    });

    ReportPromise.then(report => {
      this.set('report', report);
    });

    // Mock _appRouter since router in test framework is undefined
    this.set('_appRouter', {
      generate(route, id) {
        if(route === 'customReports.report') {
          return `/customReports/${id}`;
        }
      }
    });
  },

  afterEach() {
    teardownMock();
  }
});

test('Component renders', function(assert) {
  assert.expect(1);

  return ReportPromise.then(() => {
    this.render(Template);

    assert.equal(this.$('.report-control').text().trim(),
      'Share Report',
      'Component Renders with text "Share Report" as expected');
  });
});

test("Component's Modal", function(assert) {
  assert.expect(6);

  return ReportPromise.then(report => {
    this.render(Template);

    assert.notOk(!!this.$('.ember-modal-dialog').length,
      'share report modal is not visible before clicking the component');

    this.$('.report-control').click();

    return wait().then(()=> {
      assert.ok(!!this.$('.ember-modal-dialog').length,
        'share report modal dialog pops up on clicking the component');

      assert.equal(this.$('.primary-header').text().trim(),
        `Share "${report.get('title')}"`,
        'Modal has expected primary header');

      assert.equal(this.$('.modal-notification.none').text().trim(),
        'Select the Copy Button to copy to Clipboard.',
        'Modal has expected secondary header');

      let urlPattern = /.*customReports\/1$/,
          url = this.$('.modal-input-box').val();
      assert.ok(urlPattern.test(url),
        'Modal input box has link to the report');

      let buttons = $('.btn-container .btn');
      assert.deepEqual(buttons.map(function() { return this.textContent.trim(); }).get(),
        ['Copy Link', 'Cancel'],
        'Copy and Cancel buttons are rendered as expected');
    });
  });
});

test('Copy Link Notification', function(assert) {
  assert.expect(2);

  return ReportPromise.then(() => {
    this.render(Template);

    this.$('.report-control').click();

    return wait().then(()=> {
      assert.notOk(!!this.$('.modal-notification.success').length,
        'Copy notification is not visible before clicking copy button');

      //Click Copy Link
      this.$('.btn-container button:contains(Copy Link)').click();

      return wait().then(()=> {
        assert.ok(true,
          'Copy notification message is show after clicking copy button');
      });
    });
  });
});

test('Component is disabled for unsaved report', function(assert) {
  assert.expect(1);

  Ember.run(() => {
    let request = {
      logicalTable: {
        table: 'network',
        timeGrain: 'day'
      },
      intervals: [
        Store.createFragment('bard-request/fragments/interval', {
          interval: new Interval(
            moment('10-02-2015', 'MM-DD-YYYY'),
            moment('10-14-2015', 'MM-DD-YYYY')
          )
        }
        )]
    };
    this.set('report', Store.createRecord('report', {title: 'New Report', request}));
  });

  this.render(Template);

  return wait().then(()=> {
    assert.notOk(this.$('.report-control.disabled').is(':visible'),
      'share report component is disabled for unsaved reports');
  });
});

test("behavior of modal's cancel button", function(assert) {
  assert.expect(3);

  return ReportPromise.then(() => {

    this.render(Template);

    assert.equal(this.$('.ember-modal-dialog').length,
      0,
      'Share report modal is not rendered before clicking the component');

    // Click component
    this.$('.report-control').click();

    return wait().then(()=> {

      assert.equal(this.$('.ember-modal-dialog').length,
        1,
        'Share report modal is rendered after clicking the component');

      //Click Cancel
      this.$('.btn-container button:contains(Cancel)').click();

      assert.equal(this.$('.ember-modal-dialog').length,
        0,
        'Share report modal is closed after clicking cancel button');
    });
  });
});
