import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { run } from '@ember/runloop';
import Response from 'ember-cli-mirage/response';

let Store, Container;

module('Unit | Consumer | item', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Container = this.owner;
    Store = Container.lookup('service:store');
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('delete item - success', function (assert) {
    assert.expect(3);

    let Consumer = this.owner.factoryFor('consumer:item').create({
      naviNotifications: {
        add({ title }) {
          assert.equal(title, 'Report deleted', 'A notification is sent');
        },
      },
      router: {
        transitionTo: () => {},
      },
    });

    return run(() => {
      return Store.findRecord('report', 1).then((report) => {
        assert.ok(Store.hasRecordForId('report', 1), 'Report 1 is available in the store');

        Consumer.send('deleteItem', report);

        return settled().then(() => {
          assert.notOk(Store.hasRecordForId('report', 1), 'Report 1 is deleted from the store');
        });
      });
    });
  });

  test('delete item - failure', function (assert) {
    assert.expect(3);

    //Mock Server Endpoint
    this.server.delete('/reports/:id', () => {
      return new Response(500);
    });

    return run(() => {
      return Store.findRecord('report', 1).then((report) => {
        let Consumer = this.owner.factoryFor('consumer:item').create({
          naviNotifications: {
            add({ title }) {
              assert.equal(title, 'An error occurred while deleting report', 'A error notification is sent on error');
            },
          },
          router: {
            transitionTo: () => {},
          },
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
