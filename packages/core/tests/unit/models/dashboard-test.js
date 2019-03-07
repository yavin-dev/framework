import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';

let Store;

moduleForModel('dashboard', 'Unit | Model | dashboard', {
  // Specify the other units that are required for this test.
  needs: [
    'adapter:dashboard',
    'adapter:dashboard-widget',
    'adapter:delivery-rule',
    'adapter:user',
    'config:environment',
    'model:dashboard-widget',
    'model:deliverable-item',
    'model:delivery-rule',
    'model:fragments/presentation',
    'model:report',
    'model:user',
    'serializer:dashboard',
    'serializer:dashboard-widget',
    'serializer:delivery-rule',
    'serializer:user',
    'service:user',
    'transform:moment',
    'transform:fragment',
    'validator:presence',
    'validator:recipients'
  ],
  beforeEach() {
    Store = this.store();
    setupMock();
    return this.container.lookup('service:user').findUser();
  },
  afterEach() {
    teardownMock();
  }
});

test('Retrieving Records', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 2).then(rec => {
      assert.deepEqual(
        JSON.parse(JSON.stringify(rec.toJSON())), //to remove undefined props
        {
          title: 'Dashboard 2',
          author: 'navi_user',
          createdOn: '2016-02-01 00:00:00.000',
          updatedOn: '2016-02-01 00:00:00.000',
          presentation: {
            version: 1,
            layout: [
              { column: 0, row: 0, height: 6, width: 9, widgetId: 4 },
              { column: 0, row: 6, height: 5, width: 9, widgetId: 5 }
            ],
            columns: 40
          }
        },
        'dashboard record with id 2 is found in the store'
      );

      assert.equal(
        rec.hasMany('widgets').link(),
        '/dashboards/2/widgets',
        'The nested resource link is set by the dashboard model serializer'
      );
    });
  });
});

test('user relationship', function(assert) {
  assert.expect(4);

  return Ember.run(() => {
    return Store.findRecord('user', 'navi_user').then(userModel => {
      return Store.findRecord('dashboard', 2).then(dashboard => {
        return dashboard.get('author').then(author => {
          assert.deepEqual(author, userModel, 'Dashboard author property contains user model');

          assert.ok(dashboard.get('isUserOwner'), 'Dashboard is owned by current user');

          assert.notOk(dashboard.get('isUserEditor'), 'Editors list is not currently supported');

          assert.ok(dashboard.get('canUserEdit'), 'Owner can edit dashboard');
        });
      });
    });
  });
});

test('isFavorite', function(assert) {
  assert.expect(2);

  return Ember.run(() => {
    // Make sure user is loaded into store
    return Store.findRecord('user', 'navi_user').then(() => {
      return Store.findRecord('dashboard', 2).then(model => {
        assert.notOk(model.get('isFavorite'), 'isFavorite returns false when dashboard is not in favorite list');

        return Store.findRecord('dashboard', 1).then(model => {
          assert.ok(model.get('isFavorite'), 'isFavorite returns true when dashboard is in favorite list');
        });
      });
    });
  });
});

test('Cloning Dashboards', function(assert) {
  assert.expect(1);

  return Ember.run(() => {
    return Store.findRecord('dashboard', 3).then(model => {
      let clonedModel = model.clone().toJSON(),
        expectedModel = model.toJSON();

      expectedModel.author = 'navi_user';

      // setting attributes to null, which are not necessary to check in clone object
      expectedModel.createdOn = null;
      expectedModel.updatedOn = null;

      assert.deepEqual(clonedModel, expectedModel, 'The cloned dashboard model has the same attrs as original model');
    });
  });
});

/**
 * TODO Fix test after moving to core
 * test('deliveryRuleForUser', function (assert) {
 *   assert.expect(1);
 *
 *   return Ember.run(() => {
 *     return Store.findRecord('user', 'navi_user').then(() => {
 *       return Store.findRecord('dashboard', 2).then(dashboardModel => {
 *         dashboardModel.user = {
 *           getUser: () => Store.peekRecord('user', 'navi_user')
 *         };
 *
 *         return dashboardModel.get('deliveryRuleForUser').then(rule => {
 *           assert.deepEqual(rule,
 *             Store.peekRecord('deliveryRule', 3),
 *             'deliveryRule is fetched for current user');
 *         });
 *       });
 *     });
 *   });
 * });
 */
