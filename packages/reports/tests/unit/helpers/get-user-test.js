import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import config from 'ember-get-config';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

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

  test('getUser returns user', function(assert) {
    assert.expect(1);

    let getUser = this.owner.lookup('helper:get-user');

    return settled().then(() => {
      return run(() => {
        let userFromStore = Store.peekRecord('user', config.navi.user),
          user = getUser.compute();
        assert.deepEqual(user, userFromStore, 'the user model retrieved using the helper is the current user');
      });
    });
  });
});
