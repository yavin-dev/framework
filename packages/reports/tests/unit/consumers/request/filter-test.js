import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { setupMirage } from 'ember-cli-mirage/test-support';

let consumer,
  dispatchedActions = [],
  dispatchedActionArgs = [];

const MockDispatcher = {
  dispatch(action, route, ...args) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(...args);
  },
};

module('Unit | Consumer | request filter', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer = this.owner.factoryFor('consumer:request/filter').create({ requestActionDispatcher: MockDispatcher });
    this.metadataService = this.owner.lookup('service:navi-metadata');
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('TOGGLE_DIMENSION_FILTER', function (assert) {
    assert.expect(4);

    const filter = { type: 'dimension', columnMetadata: 'age' };
    const modelFor = () => ({ request: { filters: [filter] } });

    consumer.send(RequestActions.TOGGLE_DIMENSION_FILTER, { modelFor }, 'age');
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.REMOVE_FILTER],
      'REMOVE_FILTER is dispatched when the filter exists'
    );
    assert.deepEqual(dispatchedActionArgs, [filter], 'REMOVE_FILTER is dispatched with the correct filter');

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer.send(RequestActions.TOGGLE_DIMENSION_FILTER, { modelFor }, 'browser');
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

  test('ADD_DIMENSION_FILTER', function (assert) {
    assert.expect(2);

    const dimensionMetadataModel = this.metadataService.getById('dimension', 'age', 'bardOne');
    let modelFor = () => ({
      request: {
        addFilter(filterOptions) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'dimension',
              source: 'bardOne',
              field: 'age',
              parameters: {
                field: 'id',
              },
              operator: 'in',
              values: [],
            },
            'addFilter is called with correct arguments'
          );
        },
      },
    });

    consumer.send(RequestActions.ADD_DIMENSION_FILTER, { modelFor }, dimensionMetadataModel);

    const timeDimensionMetadataModel = this.metadataService.getById('timeDimension', 'network.dateTime', 'bardOne');
    modelFor = () => ({
      request: {
        addFilter(filterOptions) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'timeDimension',
              source: 'bardOne',
              field: 'network.dateTime',
              parameters: {
                grain: 'day',
              },
              operator: 'gte',
              values: [],
            },
            'Correct default operator is added for the metadata type'
          );
        },
      },
    });
    consumer.send(RequestActions.ADD_DIMENSION_FILTER, { modelFor }, timeDimensionMetadataModel);
  });
});
