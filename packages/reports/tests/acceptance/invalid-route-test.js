import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL, click } from '@ember/test-helpers';

module('Acceptance | Navi Report | Invalid Route', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Error data request', async function(assert) {
    await visit('/reports/5/view');

    await click('.navi-column-config-item__remove-icon[aria-label="delete time-dimension Date Time (day)"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Ad Clicks"]');
    await click('.navi-column-config-item__remove-icon[aria-label="delete metric Nav Link Clicks"]');
    await click('.navi-report__run-btn');

    assert.ok(currentURL().endsWith('/invalid'), 'We are on the edit report route');
  });
});
