import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import { run } from '@ember/runloop';
import { getOwner } from '@ember/application';
import Response from 'ember-cli-mirage/response';

let Store, Container, MetadataService, Server;

module('Unit | Consumer | item', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Server = setupMock();
    Container = this.owner;
    Store = Container.lookup('service:store');
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('delete item - success', function(assert) {
    assert.expect(3);

    let Consumer = this.owner.factoryFor('consumer:item').create({
      naviNotifications: {
        add({ message }) {
          assert.equal(
            message,
            'Report "Hyrule News" deleted successfully!',
            'A notification is sent containing the item title'
          );
        }
      },
      router: {
        transitionTo: () => {}
      }
    });

    return run(() => {
      return Store.findRecord('report', 1).then(report => {
        assert.ok(Store.hasRecordForId('report', 1), 'Report 1 is available in the store');

        Consumer.send('deleteItem', report);

        return settled().then(() => {
          assert.notOk(Store.hasRecordForId('report', 1), 'Report 1 is deleted from the store');
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
        let Consumer = this.owner.factoryFor('consumer:item').create({
          naviNotifications: {
            add({ message }) {
              assert.equal(
                message,
                'OOPS! An error occurred while deleting report "Hyrule News"',
                'A notification is sent containing the widget title'
              );
            }
          },
          router: {
            transitionTo: () => {}
          }
        });

        assert.ok(Store.hasRecordForId('report', 1), 'Report 1 is available in the store');

        Consumer.send('deleteItem', report);

        return settled().then(() => {
          assert.ok(
            Store.hasRecordForId('report', 1),
            'Report 1 is still available after failed delete operation from the store'
          );
        });
      });
    });
  });
});
