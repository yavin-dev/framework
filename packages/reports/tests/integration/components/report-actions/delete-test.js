import Ember from 'ember';
import Mirage from 'ember-cli-mirage';
import { moduleForComponent, test } from 'ember-qunit';
import { hbsWithModal } from '../../../helpers/hbs-with-modal';
import wait from 'ember-test-helpers/wait';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import $ from 'jquery';

const { getOwner } = Ember;

let Template,
    Store,
    User;

moduleForComponent('report-actions/delete-report', 'Integration | Component | report actions - delete', {
  integration: true,

  beforeEach() {
    Template = hbsWithModal(
      `{{#report-actions/delete
                report=report
                _router=_router
            }}
                <span class='delete-action'>Delete Report</span>
            {{/report-actions/delete}}`,
      getOwner(this)
    );

    this._router = {
      transitionTo: () => {}
    };

    setupMock();

    Store = getOwner(this).lookup('service:store');

    let metadataService = getOwner(this).lookup('service:bard-metadata');

    return metadataService.loadMetadata().then(
      () =>  Store.findRecord('report', 1).then(report => {
        return Store.findRecord('user', 'navi_user').then(user => {
          User = user;
          this.set('report', report);
        });
      })
    );

  },
  afterEach() {
    teardownMock();
  }
});

test('Component is enabled when user is author of report', function(assert) {
  assert.expect(3);

  this.render(Template);

  assert.equal(this.$('.report-control.disabled').length,
    0,
    'Component is not disabled when user is author of the report');

  assert.equal(this.$('.delete-action').text().trim(),
    'Delete Report',
    'Component yields content as expected');

  this.$('.report-control').click();

  return wait().then(()=> {
    assert.ok(!!this.$('.ember-modal-dialog').length,
      'delete modal dialog pops up on clicking the component');
  });
});

test('Component is disabled when user is not author of report', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    return Store.findRecord('report', 3).then(report => {
      this.set('report', report);

      this.render(Template);

      assert.equal(this.$('.report-control.disabled').length,
        1,
        'Component is disabled when user is author of the report');

      assert.equal(this.$('.delete-action').text().trim(),
        'Delete Report',
        'Component yields content as expected in disabled state');

      this.$('.report-control').click();

      return wait().then(()=> {
        assert.equal(this.$('.ember-modal-dialog').length,
          0,
          'delete modal dialog does not pops up on clicking the component');
      });
    });
  });
});

test("behavior of modal's cancel button", function(assert) {
  assert.expect(4);

  this.render(Template);

  assert.equal(this.$('.ember-modal-dialog').length,
    0,
    'Delete report modal is not rendered before clicking the component');

  // Click component
  this.$('.report-control').click();

  return wait().then(()=> {

    assert.equal(this.$('.ember-modal-dialog').length,
      1,
      'Delete report modal is rendered after clicking the component');

    //Click Cancel
    this.$('.btn-container button:contains(Cancel)').click();

    assert.equal(this.$('.ember-modal-dialog').length,
      0,
      'Delete report modal is closed after clicking cancel button');

    return User.get('reports').then(reports => {
      assert.ok(reports.findBy('id', '1'),
        'User has report "1" associated with it when delete action fails');
    });
  });
});

test('Successfully delete a report', function(assert) {
  assert.expect(2);

  //Mock Server Endpoint
  server.delete('/reports/:id', (db, request) => {

    assert.equal(request.params.id,
      '1',
      'Request to delete report "1" is sent to the server');

    return new Mirage.Response(204);
  });

  //Mock Transition to
  this._router = {
    transitionTo(route) {
      assert.equal(route,
        'customReports',
        'Component triggers transition to "customReports" route after successfully deleting a report');
    }
  };

  this.render(Template);

  // Click component
  this.$('.report-control').click();

  return wait().then(()=> {

    //Click Confirm
    this.$('.btn-container button:contains(Confirm)').click();
  });
});

test('behavior of loading spinner', function(assert) {
  assert.expect(2);

  this.render(Template);

  // Click component
  this.$('.report-control').click();

  return wait().then(()=> {
    assert.equal($('.loading-message').length,
      0,
      'loading spinner is not visible before clicking confirm button');

    //Click Confirm
    this.$('.btn-container button:contains(Confirm)').click();

    assert.equal($('.loading-message').length,
      1,
      'loading spinner is visible after clicking confirm button');
  });
});

test('behavior of buttons while deleting a report', function(assert) {
  assert.expect(4);

  this.render(Template);

  // Click component
  this.$('.report-control').click();

  return wait().then(()=> {
    assert.notOk($('.btn-container button:contains(Cancel)').is(":disabled"),
      'Cancel button is not disabled before deleting a report');

    assert.notOk($('.btn-container button:contains(Confirm)').is(":disabled"),
      'Confirm button is not disabled before deleting a report');

    //Click Confirm
    this.$('.btn-container button:contains(Confirm)').click();

    assert.ok($('.btn-container button:contains(Cancel)').is(":disabled"),
      'Cancel button is disabled while deleting a report');

    assert.ok($('.btn-container button:contains(Confirm)').is(":disabled"),
      'Confirm button is disabled while deleting a report');
  });
});
