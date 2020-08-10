import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

let consumer,
  dispatchedActions = [],
  dispatchedActionArgs = [];

const MockDispatcher = {
  dispatch(action, route, ...args) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(...args);
  }
};

module('Unit | Consumer | request filter', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer = this.owner.factoryFor('consumer:request/filter').create({ requestActionDispatcher: MockDispatcher });
  });

  test('TOGGLE_DIMENSION_FILTER', function(assert) {
    assert.expect(4);

    const filter = { type: 'dimension', columnMetadata: 'age' };
    const currentModel = {
      request: {
        filters: [filter]
      }
    };

    consumer.send(RequestActions.TOGGLE_DIMENSION_FILTER, { currentModel }, 'age');
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.REMOVE_FILTER],
      'REMOVE_FILTER is dispatched when the filter exists'
    );
    assert.deepEqual(dispatchedActionArgs, [filter], 'REMOVE_FILTER is dispatched with the correct filter');

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer.send(RequestActions.TOGGLE_DIMENSION_FILTER, { currentModel }, 'browser');
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.ADD_DIMENSION_FILTER],
      'ADD_DIMENSION_FILTER is dispatched when the filter does not exist'
    );
    assert.deepEqual(
      dispatchedActionArgs,
      ['browser'],
      'ADD_DIMENSION_FILTER is dispatched with the correct dimension metadata model'
    );
  });

  test('ADD_DIMENSION_FILTER', function(assert) {
    assert.expect(1);

    const dimensionMetadataModel = {
      id: 'age',
      primaryKeyFieldName: 'id',
      source: 'bardOne'
    };

    const currentModel = {
      request: {
        addFilter(filterOptions) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'dimension',
              dataSource: 'bardOne',
              field: 'age',
              parameters: {
                field: 'id'
              },
              operator: 'in',
              values: []
            },
            'addFilter is called with correct arguments'
          );
        }
      }
    };

    consumer.send(RequestActions.ADD_DIMENSION_FILTER, { currentModel }, dimensionMetadataModel);
  });
});
