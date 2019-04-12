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

  // Create empty filter to make request invalid
  click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');

  andThen(() => {
    assert.notOk(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is hidden when all metrics is disabled'
    );
  });

  // Remove empty filter and run query
  click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');
  click('.navi-report__run-btn');
  andThen(() => {
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is once again visible after running the latest request'
    );
  });
});
