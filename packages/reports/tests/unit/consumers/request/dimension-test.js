import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

let Age, CurrentModel, EventId, Consumer;

module('Unit | Consumer | request dimension', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    const metadataService = this.owner.lookup('service:bard-metadata');

    Consumer = this.owner.lookup('consumer:request/dimension');
    CurrentModel = {
      request: store.createFragment('bard-request/request', { dimensions: [] })
    };

    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/dimension');

    return metadataService.loadMetadata().then(() => {
      Age = metadataService.getById('dimension', 'age');
      EventId = metadataService.getById('dimension', 'eventId');
    });
  });

  test('ADD_DIMENSION', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, Age);
    });

    assert.deepEqual(
      get(CurrentModel, 'request.dimensions').mapBy('dimension')[0],
      Age,
      'addDimension adds the given dimension to the request'
    );
  });

  test('REMOVE_DIMENSION', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, Age);
      Consumer.send(RequestActions.REMOVE_DIMENSION, { currentModel: CurrentModel }, Age);
    });

    assert.strictEqual(
      get(CurrentModel, 'request.dimensions.length'),
      0,
      'The given dimension is removed from the request'
    );
  });

  test('REMOVE_DIMENSION_FRAGMENT', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, Age);
      Consumer.send(
        RequestActions.REMOVE_DIMENSION_FRAGMENT,
        { currentModel: CurrentModel },
        CurrentModel.request.dimensions.firstObject
      );
    });

    assert.strictEqual(
      get(CurrentModel, 'request.dimensions.length'),
      0,
      'The given dimension is removed from the request'
    );
  });

  test('DID_UPDATE_TABLE', function(assert) {
    assert.expect(2);

    Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, Age);
    Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, EventId);

    assert.deepEqual(
      CurrentModel.request.dimensions.mapBy('dimension'),
      [Age, EventId],
      'Both given dimensions are added to request'
    );

    Consumer.send(
      RequestActions.DID_UPDATE_TABLE,
      { currentModel: CurrentModel },
      {
        dimensions: [Age] // Table with no event id
      }
    );

    assert.deepEqual(
      CurrentModel.request.dimensions.mapBy('dimension'),
      [Age],
      'EventId dimension is removed since it was not found in the new time grain'
    );
  });
});
