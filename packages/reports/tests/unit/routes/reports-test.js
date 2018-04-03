import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import Mirage from 'ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

const { getOwner, get } = Ember;

let metadataService;

moduleFor('route:reports', 'Unit | Route | reports', {
  needs: [
    'adapter:report',
    'adapter:delivery-rule',
    'adapter:user',
    'model:report',
    'model:user',
    'model:delivery-rule',
    'model:deliverable-item',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:line-chart',
    'model:visualization',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'service:bard-metadata',
    'adapter:bard-metadata',
    'serializer:report',
    'serializer:user',
    'serializer:delivery-rule',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:navi-notifications',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'service:bard-dimensions',
    'adapter:dimensions/bard',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:presence',
    'validator:interval',
    'validator:recipients',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain'
  ],
  beforeEach() {
    setupMock();
    metadataService = getOwner(this).lookup('service:bard-metadata');
    return metadataService.loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('delete report - success', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    const route = this.subject({
      naviNotifications: {
        add({ message }) {
          assert.equal(message,
            'Report "Hyrule News" deleted successfully!',
            'A notification is sent containing the report title');
        }
      },
      // report name is captured in integration test
      reportName: 'Hyrule News',
      transitionTo: () => null
    });

    return Ember.run(() => {
      return route.store.findRecord('report', 1).then((report) => {
        assert.ok(route.store.hasRecordForId('report',1),
          'Report 1 is available in the store');

        route.send('deleteReport', report);

        return wait().then(() => {
          assert.notOk(route.store.hasRecordForId('report',1),
            'Report 1 is deleted from the store');
        });
      });
    });
  });
});

test('delete report - failure', function(assert) {
  assert.expect(3);

  //Mock Server Endpoint
  server.delete('/reports/:id/', () => {
    return new Mirage.Response(500);
  });

  let route = this.subject({
    naviNotifications: {
      add({ message }) {
        assert.equal(message,
          'OOPS! An error occurred while deleting report "Hyrule News"',
          'A notification is sent containing the widget title');
      }
    },
    // report name test is captured in integration test
    reportName: 'Hyrule News',
  });

  return Ember.run(() => {
    return route.store.findRecord('report', 1).then((report) => {
      assert.ok(route.store.hasRecordForId('report',1),
        'Report 1 is available in the store');

      route.send('deleteReport', report);

      return wait().then(() => {
        assert.ok(route.store.hasRecordForId('report',1),
          'Report 1 is still available after failed delete operation from the store');
      });
    });
  });
});

test('save schedule - success', function(assert) {
  assert.expect(2);

  let route = this.subject();

  return Ember.run(() => {
    return route.store.findRecord('report', 1).then(report => {
      return get(report, 'author').then(owner => {
        let newRule = route.store.createRecord('delivery-rule', {
          deliveryType: 'report',
          format: { type: 'csv' },
          deliveredItem: report,
          owner: owner
        });

        assert.ok(get(newRule, 'hasDirtyAttributes'),
          'Delivery rule is not saved');

        route.send('saveDeliveryRule', newRule);

        return wait().then(() => {
          assert.notOk(get(newRule, 'hasDirtyAttributes'),
            '`saveDeliveryRule` action saves the dirty delivery rule')
        });
      });
    });
  });
});

test('delete delivery rule - success', function(assert) {
  assert.expect(3);

  return Ember.run(() => {
    const route = this.subject({
      naviNotifications: {
        add({ message }) {
          assert.equal(message,
            'Report delivery schedule successfully removed!',
            'A notification is sent when a delivery rule is removed');
        }
      }
    });

    return Ember.run(() => {
      return route.store.findRecord('deliveryRule', 1).then((rule) => {
        assert.ok(route.store.hasRecordForId('deliveryRule',1),
          'Delivery Rule 1 is available in the store');

        route.send('deleteDeliveryRule', rule);

        return wait().then(() => {
          assert.notOk(route.store.hasRecordForId('deliveryRule',1),
            'Delivery Rule 1 is deleted from the store');
        });
      });
    });
  });
});

test('delete delivery rule - failure', function(assert) {
  assert.expect(3);

  //Mock Server Endpoint
  server.delete('/deliveryRules/:id/', () => {
    return new Mirage.Response(500);
  });

  let route = this.subject({
    naviNotifications: {
      add({ message }) {
        assert.equal(message,
          'OOPS! An error occurred while removing the report delivery schedule.',
          'A notification is sent when failing to delete a delivery rule');
      }
    }
  });

  return Ember.run(() => {
    return route.store.findRecord('deliveryRule', 1).then((rule) => {
      assert.ok(route.store.hasRecordForId('deliveryRule',1),
        'DeliveryRule 1 is available in the store');

      route.send('deleteDeliveryRule', rule);

      return wait().then(() => {
        assert.ok(route.store.hasRecordForId('deliveryRule',1),
          'DeliveryRule 1 is still available after failed delete operation from the store');
      });
    });
  });
});
