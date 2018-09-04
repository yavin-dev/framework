import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { initialize as extendUserModel } from 'navi-dashboards/initializers/user-model';

let Store;

moduleForModel('user', 'Unit | Initializer | user', {
  needs: [
    'model:report',
    'model:delivery-rule',
    'adapter:user',
    'adapter:report',
    'serializer:user',
    'serializer:report',
    // Request model
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'service:user',
    'adapter:dimensions/bard',
    'model:dashboard',
    'model:dashboard-collection',
    'model:dashboard-widget',
    'validator:presence'
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    extendUserModel();
  },

  afterEach() {
    teardownMock();
  }
});

test('Linking Dashboards to Users', function(assert) {
  assert.expect(4);

  return Ember.run(() => {
    let user = Store.createRecord('user', { id: 'ceila' });

    Store.createRecord('dashboard', {
      title: 'Time and Courage',
      author: user
    });

    assert.equal(user.get('dashboards.length'),
      1,
      'One dashboard is linked to the user');

    assert.deepEqual(user.get('dashboards').mapBy('title'),
      [ 'Time and Courage' ],
      'The linked dashboards are fetched via the relationship');

    assert.ok(user.get('reports'),
      'Reports relationship is part of the model');

    assert.ok(user.get('favoriteReports'),
      'Reports relationship is part of the model');
  });
});
