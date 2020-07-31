import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { click, currentRouteName, visit } from '@ember/test-helpers';
// @ts-ignore
import { linkContains } from 'navi-core/test-support/contains-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Admin', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('navigate to roles route', async function(assert) {
    assert.expect(3);

    await visit('/admin');
    assert.equal(currentRouteName(), 'admin.index', 'loads admin route');

    await click(linkContains('Manage Users'));
    assert.equal(currentRouteName(), 'admin.users', 'loads users route');

    await click(linkContains('Query Stats'));
    assert.equal(currentRouteName(), 'admin.querystats', 'loads querystats route');
  });
});
