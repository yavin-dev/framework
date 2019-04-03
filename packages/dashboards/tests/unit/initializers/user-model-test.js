import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { initialize as extendUserModel } from 'navi-dashboards/initializers/user-model';

let Store;

module('Unit | Initializer | user', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    extendUserModel();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('Linking Dashboards to Users', function(assert) {
    assert.expect(4);

    return run(() => {
      let user = Store.createRecord('user', { id: 'ceila' });

      Store.createRecord('dashboard', {
        title: 'Time and Courage',
        author: user
      });

      assert.equal(user.get('dashboards.length'), 1, 'One dashboard is linked to the user');

      assert.deepEqual(
        user.get('dashboards').mapBy('title'),
        ['Time and Courage'],
        'The linked dashboards are fetched via the relationship'
      );

      assert.ok(user.get('reports'), 'Reports relationship is part of the model');

      assert.ok(user.get('favoriteReports'), 'Reports relationship is part of the model');
    });
  });
});
