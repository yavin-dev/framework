import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import config from 'ember-get-config';

const { getOwner } = Ember;

let Store,
    MetadataService;

moduleForModel('user', 'Unit | Model | user', {
  needs: [
    'model:report',
    'model:delivery-rule',
    'model:dashboard',
    'adapter:user',
    'adapter:report',
    'adapter:delivery-rule',
    'adapter:dimensions/bard',
    'adapter:bard-metadata',
    // Request model
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:line-chart',
    'model:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:fragments/presentation',
    'model:deliverable-item',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:bard-metadata',
    'serializer:user',
    'serializer:report',
    'serializer:delivery-rule',
    'serializer:visualization',
    'service:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:bard-dimensions',
    'service:user',
    'validator:length',
    'validator:belongs-to',
    'validator:presence',
    'validator:interval',
    'validator:has-many',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-time-grain',
    'validator:request-dimension-order',
    'validator:request-filters',
    'validator:array-empty-value',
    'validator:array-number',
    'validator:recipients'
  ],

  beforeEach() {
    setupMock();
    Store = this.store();
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    MetadataService.loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('Retrieving records', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(() => {
      assert.ok(true, 'Found navi user');
    });
  });
});

test('Saving records', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    let newUser = 'new_user';
    return Store.createRecord('user', { id: newUser}).save().then(() => {
      Store.unloadAll('user'); // flush cache/store
      return Store.findRecord('user', newUser).then(() => {
        assert.ok(true, 'Newly created user is successfully persisted');
      });
    });
  });
});

test('Linking Reports to Users', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    let user = Store.createRecord('user', { id: 'jon_snow' });

    Store.createRecord('report', {
      title: 'How I died! By Jon Snow',
      author: user
    });

    Store.createRecord('report', {
      title: 'You know nothing, Jon Snow',
      author: user
    });

    assert.equal(user.get('reports.length'),
      2,
      'Two reports are linked to the user');

    assert.deepEqual(user.get('reports').map(report => { return report.get('title'); }),
      [
        'How I died! By Jon Snow',
        'You know nothing, Jon Snow'
      ],
      'The user is linked to the report, and the reports can be fetched via the relationship');

    assert.equal(user.get('favoriteReports.length'),
      0,
      'Creating reports under a user does not impact their favorite reports');
  });
});

test('Favoriting reports', function(assert) {
  assert.expect(3);

  let naviUser = config.navi.user;

  return Ember.run(() => {
    return Store.findRecord('user', naviUser).then(user => {
      /*
       * Fetch all reports favorited by test user or else Ember Data throws error when calling `unloadAll`
       * https://github.com/emberjs/data/issues/3084
       */
      return Store.findRecord('report', 2).then(() => {
        return Store.findRecord('report', 1).then(report => {
          // Favorite a report
          user.get('favoriteReports').pushObject(report);

          return user.save().then(() => {
            assert.equal(user.get('favoriteReports.lastObject.title'),
              'Hyrule News',
              'Favorite reports contains full report object');

            // flush cache/Store
            Store.unloadAll();

            return Store.findRecord('user', naviUser).then(savedUser => {

              assert.deepEqual(savedUser.get('favoriteReports').mapBy('id'),
                [ "2", "1" ],
                'Reports can be added to user favorites');

              // Trigger async request and wait
              return savedUser.get('favoriteReports').then(() => {
                assert.equal(savedUser.get('favoriteReports.lastObject.title'),
                  'Hyrule News',
                  'Accessing favoriteReports relationship returns full report object');
              });
            });
          });
        });
      });
    });
  });
});

test('delivery rules relationship', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('deliveryRule', 1).then(deliveryRule => {
      return Store.findRecord('user', 'navi_user').then(userModel => {
        return userModel.get('deliveryRules').then(rules => {
          assert.equal(rules.get('firstObject'),
            deliveryRule,
            'user deliveryRule property contains deliveryRule model');
        });
      });
    });
  });
});
