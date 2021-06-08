import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL } from '@ember/test-helpers';

module('Acceptance | Navi Report | Unauthorized Route', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Error data request', async function (assert) {
    await visit('/reports/15/view');
    assert.ok(currentURL().endsWith('/unauthorized'), 'Unauthorized request transition to the unauthorized route');
  });
});
