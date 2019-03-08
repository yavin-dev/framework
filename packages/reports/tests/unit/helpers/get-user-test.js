import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { moduleFor, test } from 'ember-qunit';
import config from 'ember-get-config';
import wait from 'ember-test-helpers/wait';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Store;

moduleFor('helper:get-user', 'Unit | Helper | get user', {
  needs: [
    'service:user',
    'model:user',
    'adapter:user',
    'model:report',
    'serializer:user',
    'model:delivery-rule',
    'model:dashboard'
  ],
  beforeEach() {
    setupMock();
    Store = getOwner(this).lookup('service:store');
    Store.find('user', config.navi.user);
  },
  afterEach() {
    teardownMock();
  }
});

test('getUser returns user', function(assert) {
  assert.expect(1);

  let getUser = this.subject();

  return wait().then(() => {
    return run(() => {
      let userFromStore = Store.peekRecord('user', config.navi.user),
        user = getUser.compute();
      assert.deepEqual(user, userFromStore, 'the user model retrieved using the helper is the current user');
    });
  });
});
