import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptances | Report to dashboard action', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Add to dashboard button - flag true', async function (assert) {
    assert.expect(1);

    await visit('/reports/1/view');
    assert
      .dom('.report-actions__add-to-dashboard')
      .isVisible('Add to Dashboard button is visible when feature flag is on');
  });

  test('Add to dashboard button is hidden when there are unrun request changes', async function (assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    assert.dom('.report-actions__add-to-dashboard').isEnabled('Add to Dashboard button is enabled for a valid request');

    // Remove all columns to make invalid
    await click('.navi-column-config-item__remove-icon[aria-label="delete time-dimension Date Time (Day)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete dimension Property (id)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Nav Link Clicks"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Ad Clicks"]');

    assert
      .dom('.report-actions__add-to-dashboard')
      .isDisabled('Add to Dashboard button is disabled when all metrics are removed');

    // Revert changes and run query
    await click('.navi-report__revert-btn');
    await click('.navi-report__run-btn');

    assert
      .dom('.report-actions__add-to-dashboard')
      .isEnabled('Add to Dashboard button is once again enabled after running a valid request');
  });
});
