import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let Store, MetadataService, Age, EventId, CurrentModel, Consumer;

module('Unit | Consumer | request dimension', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    Store = this.owner.lookup('service:store');

    MetadataService = this.owner.lookup('service:bard-metadata');

    Consumer = this.owner.lookup('consumer:request/dimension');
    CurrentModel = {
      request: Store.createFragment('bard-request/request', { dimensions: [] })
    };

    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/dimension');

    return MetadataService.loadMetadata().then(() => {
      Age = MetadataService.getById('dimension', 'age');
      EventId = MetadataService.getById('dimension', 'eventId');
    });
  });

  hooks.afterEach(function() {
    teardownMock();
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

    assert.ok(get(CurrentModel, 'request.dimensions.length') === 0, 'The given dimension is removed from the request');
  });

  test('DID_UPDATE_TIME_GRAIN', function(assert) {
    assert.expect(2);

    run(() => {
      Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, Age);
      Consumer.send(RequestActions.ADD_DIMENSION, { currentModel: CurrentModel }, EventId);
    });

    assert.deepEqual(
      get(CurrentModel, 'request.dimensions').mapBy('dimension'),
      [Age, EventId],
      'Both given dimensions are added to request'
    );

    Consumer.send(
      RequestActions.DID_UPDATE_TIME_GRAIN,
      { currentModel: CurrentModel },
      {
        dimensions: [Age] // Time grain with no event id
      }
    );

    assert.deepEqual(
      get(CurrentModel, 'request.dimensions').mapBy('dimension'),
      [Age],
      'EventId dimension is removed since it was not found in the new time grain'
    );
  });
});
