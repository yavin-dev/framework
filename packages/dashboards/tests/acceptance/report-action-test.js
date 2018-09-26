import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let Application;

module('Acceptances | Report to dashboard action', {
  beforeEach() {
    Application = startApp();
  },
  afterEach() {
    server.shutdown();
    Ember.run(Application, 'destroy');
  }
});

test('Add to dashboard button - flag true', function(assert) {
  assert.expect(1);

  visit('/reports/1/view');
  andThen(() => {
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is visible when feature flag is on'
    );
  });
});

test('Add to dashboard button is hidden when there are unrun request changes', function(assert) {
  assert.expect(3);

  visit('/reports/1/view');
  andThen(() => {
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is visible by default'
    );
  });

  /*
   * Change request
   * Remove all metrics to create an invalid report
   */
  click('.checkbox-selector--metric .grouped-list__item:contains(Ad Clicks) .grouped-list__item-label');
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  andThen(() => {
    assert.notOk(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is hidden when all metrics is disabled'
    );
  });

  // Reselect the merics and Run the report
  click('.checkbox-selector--metric .grouped-list__item:contains(Nav Link Clicks) .grouped-list__item-label');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is once again visible after running the latest request'
    );
  });
});
