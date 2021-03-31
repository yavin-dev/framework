import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type UserModel from 'navi-core/models/user';

let User: UserModel;

module('Integration | Helper | get user', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    User = await store.find('user', config.navi.user);
  });

  test('getUser returns user', async function (assert) {
    await render(hbs`{{get (get-user) 'id'}}`);
    assert.deepEqual(
      this.element.textContent?.trim(),
      User.id,
      'the user model retrieved using the helper is the current user'
    );
  });
});
