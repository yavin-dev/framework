import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

module('Unit | Consumer | request time grain', function(hooks) {
  setupTest(hooks);

  test('ADD_TIME_GRAIN', function(assert) {
    assert.expect(5);

    const MockDispatcher = {
      dispatch(action, route, timeGrain) {
        assert.equal(
          action,
          RequestActions.DID_UPDATE_TIME_GRAIN,
          'DID_UPDATE_TIME_GRAIN is dispatched once time grain is changed'
        );

        assert.deepEqual(timeGrain, { id: 'newTimeGrain' }, 'New time grain is passed to the action');

        assert.step('sent only once');
      }
    };

    const currentModel = {
        request: {
          timeGrain: 'oldTimeGrain',
          updateTimeGrain: timeGrain =>
            assert.equal(timeGrain, 'newTimeGrain', 'request is updated with the new time grain id')
        }
      },
      consumer = this.owner
        .factoryFor('consumer:request/time-grain')
        .create({ requestActionDispatcher: MockDispatcher });

    consumer.send(RequestActions.ADD_TIME_GRAIN, { currentModel }, { id: 'newTimeGrain' });

    currentModel.request.timeGrain = 'newTimeGrain';

    consumer.send(RequestActions.ADD_TIME_GRAIN, { currentModel }, { id: 'newTimeGrain' });

    assert.verifySteps(['sent only once'], 'DID_UPDATE_TIME_GRAIN is not dispatched if time grain is not changed');
  });

  test('REMOVE_TIME_GRAIN', function(assert) {
    assert.expect(3);

    const MockDispatcher = {
      dispatch(action, route, timeGrain) {
        assert.equal(
          action,
          RequestActions.DID_UPDATE_TIME_GRAIN,
          'DID_UPDATE_TIME_GRAIN is dispatched once time grain is removed'
        );

        assert.deepEqual(timeGrain, { id: 'all' }, '`all` time grain is passed to the action');
      }
    };

    const currentModel = {
        request: {
          timeGrain: 'oldTimeGrain',
          updateTimeGrain: timeGrain => assert.equal(timeGrain, 'all', 'request is updated with the `all` time grain')
        }
      },
      consumer = this.owner
        .factoryFor('consumer:request/time-grain')
        .create({ requestActionDispatcher: MockDispatcher });

    consumer.send(RequestActions.REMOVE_TIME_GRAIN, { currentModel }, { id: 'newTimeGrain' });
  });
});
