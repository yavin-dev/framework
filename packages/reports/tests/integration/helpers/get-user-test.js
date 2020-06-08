import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Helper | get user', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const store = this.owner.lookup('service:store');
    this.user = await store.find('user', config.navi.user);
  });

  test('getUser returns user', async function(assert) {
    await render(hbs`{{get (get-user) 'id'}}`);
    assert.deepEqual(
      this.element.textContent.trim(),
      this.user.id,
      'the user model retrieved using the helper is the current user'
    );
  });
});
