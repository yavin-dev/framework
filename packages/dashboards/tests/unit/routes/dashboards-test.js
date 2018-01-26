import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';
import Mirage from 'ember-cli-mirage';
import Ember from 'ember';

moduleFor('route:dashboards', 'Unit | Route | dashboards', {
  needs: [
    'model:dashboard',
    'adapter:dashboard',
    'serializer:dashboard',
    'model:dashboard-widget',
    'transform:fragment',
    'model:fragments/presentation',
    'model:user',
    'adapter:dashboard-widget',
    'serializer:dashboard-widget',
    'transform:moment',
    'service:navi-notifications',
    'service:user'
  ],

  beforeEach(){
    setupMock();
  },

  afterEach(){
    teardownMock();
  }
});

test('delete dashboard - success', function(assert) {
  assert.expect(3);

  let route = this.subject({
    naviNotifications: {
      add({ message }) {
        assert.equal(message,
          'Dashboard "Tumblr Goals Dashboard" deleted successfully!',
          'A notification is sent containing the dashboard title');
      }
    },
    transitionTo: Ember.K
  });

  return Ember.run(() => {
    return route.store.findRecord('dashboard', 1).then((dashboard) => {
      assert.ok(route.store.hasRecordForId('dashboard',1),
        'Dashboard 1 is available in the store');

      route.send('deleteDashboard', dashboard);

      return wait().then(() => {
        assert.notOk(route.store.hasRecordForId('dashboard',1),
          'Dashboard 1 is deleted from the store');
      });
    });
  });
});

test('delete dashboard - failure', function(assert) {
  assert.expect(3);

  //Mock Server Endpoint
  server.delete('/dashboards/:id/', () => {
    return new Mirage.Response(500);
  });

  let route = this.subject({
    naviNotifications: {
      add({ message }) {
        assert.equal(message,
          'OOPS! An error occurred while deleting dashboard "Tumblr Goals Dashboard"',
          'A notification is sent containing the widget title');
      }
    }
  });

  return Ember.run(() => {
    return route.store.findRecord('dashboard', 1).then((dashboard) => {
      assert.ok(route.store.hasRecordForId('dashboard',1),
        'Dashboard 1 is available in the store');

      route.send('deleteDashboard', dashboard);

      return wait().then(() => {
        assert.ok(route.store.hasRecordForId('dashboard',1),
          'Dashboard 1 is still available after failed delete operation from the store');
      });
    });
  });
});
