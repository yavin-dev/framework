import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Store,
    Model;

moduleForModel('dashboard-collection', 'Unit | Model | dashboard collection', {
  // Specify the other units that are required for this test.
  needs: [
    'model:dashboard',
    'model:dashboard-widget',
    'model:user',
    'transform:moment',
    'serializer:dashboard-collection',
    'adapter:dashboard-collection',
    'config:environment',
    'service:user'
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    Model = this.subject();
  },
  afterEach() {
    teardownMock();
  }
});

test('it exists', function(assert) {
  assert.expect(1);

  assert.ok(!!Model,
    'Dashboard Collection model exists');
});

test('Retrieving Records', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('dashboard-collection', 1).then(rec => {
      assert.deepEqual(rec.toJSON(),
        {
          title: 'Collection 1',
          author: 'navi_user',
          dashboards: ['1', '3'],
          createdOn: '2016-01-01 00:00:00.000',
          updatedOn: '2016-01-01 00:00:00.000'
        },
        'dashboard collection record with id 1 is found in the store');
    });
  });
});
