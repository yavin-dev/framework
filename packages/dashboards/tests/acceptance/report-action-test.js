import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import $ from 'jquery';

module('Acceptances | Report to dashboard action', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Add to dashboard button - flag true', async function(assert) {
    assert.expect(1);

    await visit('/reports/1/view');
    assert.ok(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is visible when feature flag is on'
    );
  });

  test('Add to dashboard button is hidden when there are unrun request changes', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');

    assert.ok(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is visible by default'
    );

    // Remove all columns to make invalid
    await click('.navi-column-config-item__remove-icon[aria-label="delete time-dimension Date Time (day)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete dimension Property (id)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Nav Link Clicks"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Ad Clicks"]');

    assert.notOk(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is hidden when all metrics is disabled'
    );

    // Revert changes and run query
    await click('.navi-report__revert-btn');
    await click('.navi-report__run-btn');

    assert.ok(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is once again visible after running the latest request'
    );
  });
});
