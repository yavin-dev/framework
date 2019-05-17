import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { setOwner } from '@ember/application';

let Store;

module('Unit | Helper | get user', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    Store.find('user', config.navi.user);
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('getUser returns user', async function(assert) {
    assert.expect(1);

    let getUser = await this.owner.lookup('helper:get-user');
    let helper = new getUser();

    setOwner(helper, this.owner);

    let userFromStore = Store.peekRecord('user', config.navi.user),
      user = helper.compute();

    assert.deepEqual(user, userFromStore, 'the user model retrieved using the helper is the current user');
  });
});
