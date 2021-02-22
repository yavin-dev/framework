import { click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | delete transition', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('transitions to directory on asset deletion', async function (assert) {
    assert.expect(2);

    await visit('/reports/1');

    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    await click('.delete__action-btn');
    await click('.delete__delete-btn');

    assert.equal(
      currentURL(),
      '/directory/my-data',
      'Transitions to directory after deleting an asset when directory is enabled'
    );
  });

  test('transitions to asset route on deletion', async function (assert) {
    assert.expect(2);
    config.navi.FEATURES.enableDirectory = false;

    await visit('/reports/1');

    assert.equal(currentURL(), '/reports/1/view', 'Start off viewing report 1');

    await click('.delete__action-btn');
    await click('.delete__delete-btn');

    assert.equal(
      currentURL(),
      '/reports',
      'Transitions to assets route after deleting an asset when directory is disabled'
    );

    config.navi.FEATURES.enableDirectory = true;
  });
});
