import { click, visit } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';

let Application;

module('Acceptances | Report to dashboard action', function(hooks) {
  hooks.beforeEach(function() {
    Application = startApp();
  });

  hooks.afterEach(function() {
    server.shutdown();
    run(Application, 'destroy');
  });

  test('Add to dashboard button - flag true', async function(assert) {
    assert.expect(1);

    await visit('/reports/1/view');
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is visible when feature flag is on'
    );
  });

  test('Add to dashboard button is hidden when there are unrun request changes', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is visible by default'
    );

  // Create empty filter to make request invalid
  await click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');

  assert.notOk(
    find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
    'Add to Dashboard button is hidden when all metrics is disabled');

  // Remove empty filter and run query
  await click('.grouped-list__item:Contains(Operating System) .checkbox-selector__filter');
  await click('.navi-report__run-btn');
    assert.ok(
      find('.navi-report__action:contains("Add to Dashboard")').is(':visible'),
      'Add to Dashboard button is once again visible after running the latest request'
    );
  });
});
