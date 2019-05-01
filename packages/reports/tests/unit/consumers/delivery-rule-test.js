import { moduleFor, test } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';
import Response from 'ember-cli-mirage/response';
import wait from 'ember-test-helpers/wait';

let Store, Container, MetadataService;

moduleFor('consumer:delivery-rule', 'Unit | Consumer | delivery-rule', {
  needs: [
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'adapter:report',
    'adapter:delivery-rule',
    'adapter:user',
    'consumer:action-consumer',
    'model:report',
    'model:user',
    'model:dashboard',
    'model:delivery-rule',
    'model:deliverable-item',
    'model:bard-request/request',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/having',
    'model:bard-request/fragments/logical-table',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/sort',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:line-chart',
    'model:visualization',
    'model:metadata/time-grain',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'serializer:delivery-rule',
    'service:request-action-dispatcher',
    'service:delivery-rule-action-dispatcher',
    'service:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:bard-dimensions',
    'service:user',
    'service:navi-notifications',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'validator:recipients',
    'validator:chart-type',
    'validator:request-metrics',
    'validator:request-metric-exist',
    'validator:request-dimension-order',
    'validator:request-time-grain',
    'validator:request-filters',
    'validator:number',
    'validator:array-number'
  ],

  async beforeEach() {
    this.server = await startMirage();
    Container = getOwner(this);
    Store = Container.lookup('service:store');
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    await MetadataService.loadMetadata();
  },

  afterEach() {
    return this.server.shutdown();
  }
});

test('delete delivery-rule - success', function(assert) {
  assert.expect(2);

  let Consumer = this.subject(),
    promise = {
      resolve() {
        assert.notOk(Store.hasRecordForId('delivery-rule', 1), 'Delivery Rule is deleted from the store');
      },
      reject() {
        assert.notOk(true, 'Passed in promise is not rejected when delete is successful');
      }
    };

  return run(() => {
    let rule = Store.createRecord('delivery-rule', {
      id: 1,
      deliveryType: 'report',
      deliveredItem: {},
      owner: 'navi_user'
    });
    assert.ok(Store.hasRecordForId('delivery-rule', 1), 'Delivery Rule 1 is available in the store');

    Consumer.send('deleteDeliveryRule', rule, promise);
  });
});

test('delete delivery-rule - failure', function(assert) {
  assert.expect(2);

  //Mock Server Endpoint
  this.server.del('/deliveryRules/:id', () => {
    return new Response(500);
  });

  let Consumer = this.subject(),
    promise = {
      resolve() {
        assert.notOk(true, 'Passed in promise is not resolved when delete fails');
      },
      reject() {
        assert.ok(Store.hasRecordForId('delivery-rule', 2), 'Delivery Rule is not deleted from the store');
      }
    };

  return run(() => {
    return Store.findRecord('delivery-rule', 2).then(rule => {
      assert.ok(Store.hasRecordForId('delivery-rule', 2), 'Delivery Rule 1 is available in the store');

      Consumer.send('deleteDeliveryRule', rule, promise);

      return wait();
    });
  });
});

test('save delivery-rule - success', function(assert) {
  assert.expect(3);

  let Consumer = this.subject(),
    promise = {
      resolve() {
        assert.ok(true, 'Passed in promise is resolved when save succeeds');
      },
      reject() {
        assert.notOk(true, 'Passed in promise is not rejected when save succeeds');
      }
    };

  return run(() => {
    return Store.findRecord('report', 1).then(report => {
      return get(report, 'author').then(owner => {
        let newRule = Store.createRecord('delivery-rule', {
          deliveryType: 'report',
          format: { type: 'csv' },
          deliveredItem: report,
          owner
        });

        assert.ok(get(newRule, 'hasDirtyAttributes'), 'Delivery rule is not saved');

        Consumer.send('saveDeliveryRule', newRule, promise);

        return wait().then(() => {
          assert.notOk(get(newRule, 'hasDirtyAttributes'), 'saveDeliveryRule action saves the dirty delivery rule');
        });
      });
    });
  });
});
