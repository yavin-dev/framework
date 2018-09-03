import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import Response from 'ember-cli-mirage/response';
import wait from 'ember-test-helpers/wait';

let Store,
    Container,
    MetadataService,
    Server;

moduleFor('consumer:item', 'Unit | Consumer | item', {
  needs: [
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'adapter:report',
    'adapter:delivery-rule',
    'adapter:user',
    'consumer:action-consumer',
    'model:report',
    'model:user',
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
    'service:request-action-dispatcher',
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
    'validator:array-number',
  ],

  beforeEach() {
    Server = setupMock();
    Container = getOwner(this);
    Store = Container.lookup('service:store');
    MetadataService = getOwner(this).lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  },

  afterEach() {
    teardownMock();
  }
});

test('delete item - success', function(assert) {
  assert.expect(3);

  let Consumer = this.subject({
    naviNotifications: {
      add({ message }) {
        assert.equal(message,
          'Report "Hyrule News" deleted successfully!',
          'A notification is sent containing the item title');
      }
    },
    router: {
      transitionTo: () => {}
    }
  });

  return run(() => {
    return Store.findRecord('report', 1).then(report => {
      assert.ok(Store.hasRecordForId('report', 1),
        'Report 1 is available in the store');

      Consumer.send('deleteItem', report);

      return wait().then(() => {
        assert.notOk(Store.hasRecordForId('report', 1),
          'Report 1 is deleted from the store');
      });
    });
  });
});

test('delete item - failure', function(assert) {
  assert.expect(3);

  //Mock Server Endpoint
  Server.delete('/reports/:id', () => {
    return new Response(500);
  });

  return run(() => {
    return Store.findRecord('report', 1).then(report => {
      let Consumer = this.subject({
        naviNotifications: {
          add({ message }) {
            assert.equal(message,
              'OOPS! An error occurred while deleting report "Hyrule News"',
              'A notification is sent containing the widget title');
          }
        },
        router: {
          transitionTo: () => {}
        }
      });

      assert.ok(Store.hasRecordForId('report',1),
        'Report 1 is available in the store');

      Consumer.send('deleteItem', report);

      return wait().then(() => {
        assert.ok(Store.hasRecordForId('report',1),
          'Report 1 is still available after failed delete operation from the store');
      });
    });

  });
});
