import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Store, Model;

module('Unit | Model | dashboard collection', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');
    Model = run(() => this.owner.lookup('service:store').createRecord('dashboard-collection'));
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it exists', function(assert) {
    assert.expect(1);

    assert.ok(!!Model, 'Dashboard Collection model exists');
  });

  test('Retrieving Records', function(assert) {
    assert.expect(1);

    return run(() => {
      return Store.findRecord('dashboard-collection', 1).then(rec => {
        assert.deepEqual(
          rec.toJSON(),
          {
            title: 'Collection 1',
            author: 'navi_user',
            dashboards: ['1', '3'],
            createdOn: '2016-01-01 00:00:00.000',
            updatedOn: '2016-01-01 00:00:00.000'
          },
          'dashboard collection record with id 1 is found in the store'
        );
      });
    });
  });
});
