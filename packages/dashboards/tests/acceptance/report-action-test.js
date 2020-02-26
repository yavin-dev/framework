import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import $ from 'jquery';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';

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

    // Create empty filter to make request invalid
    await clickItemFilter('dimension', 'Operating System');

    assert.notOk(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is hidden when all metrics is disabled'
    );

    // Remove empty filter and run query
    await clickItemFilter('dimension', 'Operating System');
    await click('.navi-report__run-btn');

    assert.ok(
      !!$('.navi-report__action:contains("Add to Dashboard")').length,
      'Add to Dashboard button is once again visible after running the latest request'
    );
  });
});
