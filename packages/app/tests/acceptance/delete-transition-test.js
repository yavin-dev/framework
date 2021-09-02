import { click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | delete transition', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('transitions to directory on asset deletion', async function (assert) {
    await visit('/reports/1');

    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    await click('.report-actions__delete');
    await click('.delete__modal-delete-btn');

    assert.equal(
      currentURL(),
      '/directory/my-data',
      'Transitions to directory after deleting an asset when directory is enabled'
    );
  });

  test('transitions to asset route on deletion', async function (assert) {
    await visit('/reports/1');

    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    await click('.report-actions__delete');
    await click('.delete__modal-delete-btn');

    assert.equal(currentURL(), '/directory/my-data', 'Transitions to home route after deleting an asset');
  });
});
