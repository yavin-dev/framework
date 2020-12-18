import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { A as arr } from '@ember/array';

let consumer,
  dispatchedActions = [],
  dispatchedActionArgs = [];

const MockDispatcher = {
  dispatch(action, route, ...args) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(...args);
  }
};

const routeFor = request => ({ modelFor: () => ({ request }) });

module('Unit | Consumer | request column', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer = this.owner.factoryFor('consumer:request/column').create({ requestActionDispatcher: MockDispatcher });
  });

  test('ADD_COLUMN_WITH_PARAMS', function(assert) {
    assert.expect(2);

    const mockColumnMetadata = { id: 'revenue', getDefaultParameters: () => ({}) };

    const request = {
      addColumnFromMetaWithParams(columnMetadataModel, parameters) {
        assert.equal(
          columnMetadataModel,
          mockColumnMetadata,
          'addColumnFromMetaWithParams is called with correct model'
        );
        assert.deepEqual(parameters, { currency: 'USD' }, 'addColumnFromMetaWithParams is called with correct params');
      }
    };

    consumer.send(RequestActions.ADD_COLUMN_WITH_PARAMS, routeFor(request), mockColumnMetadata, { currency: 'USD' });
  });

  test('REMOVE_COLUMN_FRAGMENT', function(assert) {
    assert.expect(1);

    const column = { type: 'dimension', field: 'age' };
    const request = {
      removeColumn(columnFragment) {
        assert.deepEqual(columnFragment, column, 'removeColumn is called with correct column fragment');
      }
    };

    consumer.send(RequestActions.REMOVE_COLUMN_FRAGMENT, routeFor(request), column);
  });

  test('UPDATE_COLUMN_FRAGMENT_WITH_PARAMS', function(assert) {
    assert.expect(1);

    const column = {
      updateParameters(parameters) {
        assert.deepEqual(parameters, { revenue: 'USD' }, 'updateParameters is called with correct parameters');
      }
    };

    consumer.send(RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS, null, column, 'revenue', 'USD');
  });

  test('RENAME_COLUMN_FRAGMENT', function(assert) {
    assert.expect(2);

    const request = {
      columns: arr([{ type: 'metric', alias: '', field: 'clicks', parameters: {} }]),

      renameColumn(column, alias) {
        assert.deepEqual(column, request.columns[0], 'The correct column is passed in');
        assert.deepEqual(alias, 'Number', 'The alias is Number');
      }
    };

    consumer.send(RequestActions.RENAME_COLUMN_FRAGMENT, routeFor(request), request.columns[0], 'Number');
  });

  test('REORDER_COLUMN_FRAGMENT', function(assert) {
    assert.expect(2);

    const request = {
      columns: arr([{ field: 'clicks0' }, { field: 'clicks1' }, { field: 'clicks2' }, { field: 'clicks3' }]),

      reorderColumn(column, index) {
        assert.deepEqual(column, request.columns[2], 'The correct column is passed in');
        assert.deepEqual(index, index, 'The alias is Number');
      }
    };

    consumer.send(RequestActions.REORDER_COLUMN_FRAGMENT, routeFor(request), request.columns[2], 1);
  });

  test('ADD_METRIC_FILTER', function(assert) {
    assert.expect(4);

    const request = {
      columns: [{ type: 'metric', columnMetadata: 'pageViews' }]
    };

    const route = routeFor(request);

    //existing column should not be added
    consumer.send(RequestActions.ADD_METRIC_FILTER, route, 'pageViews');

    consumer.send(RequestActions.ADD_METRIC_FILTER, route, 'adClicks');
    assert.deepEqual(dispatchedActions, [RequestActions.ADD_COLUMN_WITH_PARAMS], 'ADD_COLUMN is dispatched');
    assert.deepEqual(
      dispatchedActionArgs,
      ['adClicks', undefined],
      'ADD_COLUMN_WITH_PARAMS is dispatched with the correct metric metadata model and undefined paramters'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer.send(RequestActions.ADD_METRIC_FILTER, route, 'revenue', { currency: 'USD' });
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.ADD_COLUMN_WITH_PARAMS],
      'ADD_COLUMN_WITH_PARAMS is dispatched'
    );
    assert.deepEqual(
      dispatchedActionArgs,
      ['revenue', { currency: 'USD' }],
      'ADD_COLUMN_WITH_PARAMS is called with the correct metadata model and parameters'
    );
  });

  test('DID_UPDATE_TABLE', function(assert) {
    assert.expect(2);

    const table = {
      timeDimensions: [],
      dimensions: ['age'],
      metrics: ['adClicks']
    };
    const request = {
      columns: arr([
        { columnMetadata: 'age' },
        { columnMetadata: 'browser' },
        { columnMetadata: 'adClicks' },
        { columnMetadata: 'pageViews' }
      ])
    };

    consumer.send(RequestActions.DID_UPDATE_TABLE, routeFor(request), table);

    assert.deepEqual(
      dispatchedActions,
      [RequestActions.REMOVE_COLUMN_FRAGMENT, RequestActions.REMOVE_COLUMN_FRAGMENT],
      'REMOVE_COLUMN is dispatched for each column that is not in the new table'
    );
    assert.deepEqual(
      dispatchedActionArgs,
      [{ columnMetadata: 'browser' }, { columnMetadata: 'pageViews' }],
      'REMOVE_COLUMN_FRAGMENT is called with the correct metadata model'
    );
  });
});
