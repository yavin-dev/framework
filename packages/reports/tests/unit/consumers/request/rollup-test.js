import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { run } from '@ember/runloop';

let Store, MetadataService, Consumer, CurrentModel, OS, AGE, DEVICE_TYPE;

module('Unit | Consumer | request rollup', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');

    MetadataService = this.owner.lookup('service:bard-metadata');

    Consumer = this.owner.lookup('consumer:request/rollup');
    CurrentModel = {
      request: Store.createFragment('bard-request/request', { rollup: { columns: [], grandTotal: false } })
    };

    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/rollup');

    return MetadataService.loadMetadata().then(() => {
      OS = { dimension: MetadataService.getById('dimension', 'os') };
      AGE = { dimension: MetadataService.getById('dimension', 'age') };
      DEVICE_TYPE = { dimension: MetadataService.getById('dimension', 'userDeviceType') };
    });
  });

  test('PUSH_ROLLUP_COLUMN', function(assert) {
    assert.expect(2);
    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, OS);
    });

    assert.deepEqual(
      CurrentModel.request?.rollup?.columns.toArray()[0].dimension,
      OS.dimension,
      'addMetric adds the given metric to the request'
    );

    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, AGE);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, DEVICE_TYPE);
    });

    assert.deepEqual(
      CurrentModel.request.rollup?.columns.map(x => x.dimension.id),
      ['os', 'age', 'userDeviceType'],
      'Columns are added in the right order'
    );
  });

  test('REMOVE_ROLLUP_COLUMN', function(assert) {
    assert.expect(1);
    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, OS);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, AGE);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, { currentModel: CurrentModel }, DEVICE_TYPE);
      Consumer.send(RequestActions.REMOVE_ROLLUP_COLUMN, { currentModel: CurrentModel }, AGE);
    });

    assert.deepEqual(
      CurrentModel.request.rollup?.columns.map(x => x.dimension.id),
      ['os', 'userDeviceType'],
      'The correct columns is removed'
    );
  });

  test('UPDATE_GRAND_TOTAL', function(assert) {
    assert.expect(2);
    run(() => {
      Consumer.send(RequestActions.UPDATE_GRAND_TOTAL, { currentModel: CurrentModel }, true);
    });

    assert.ok(CurrentModel.request.rollup.grandTotal, 'Grand total is updated to true');

    run(() => {
      Consumer.send(RequestActions.UPDATE_GRAND_TOTAL, { currentModel: CurrentModel }, false);
    });

    assert.notOk(CurrentModel.request.rollup.grandTotal, 'Grand total is back to false');
  });
});
