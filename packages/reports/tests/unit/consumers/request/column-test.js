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

module('Unit | Consumer | request column', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer = this.owner.factoryFor('consumer:request/column').create({ requestActionDispatcher: MockDispatcher });
  });

  test('ADD_COLUMN', function(assert) {
    assert.expect(1);

    const currentModel = {
      request: {
        addColumnFromMeta(columnMetadataModel) {
          assert.equal(columnMetadataModel, 'age', 'addColumnFromMeta is called with correct model');
        }
      }
    };

    consumer.send(RequestActions.ADD_COLUMN, { currentModel }, 'age');
  });

  test('ADD_COLUMN_WITH_PARAMS', function(assert) {
    assert.expect(2);

    const currentModel = {
      request: {
        addColumnFromMetaWithParams(columnMetadataModel, parameters) {
          assert.equal(columnMetadataModel, 'revenue', 'addColumnFromMetaWithParams is called with correct model');
          assert.deepEqual(
            parameters,
            { currency: 'USD' },
            'addColumnFromMetaWithParams is called with correct params'
          );
        }
      }
    };

    consumer.send(RequestActions.ADD_COLUMN_WITH_PARAMS, { currentModel }, 'revenue', { currency: 'USD' });
  });

  test('REMOVE_COLUMN', function(assert) {
    assert.expect(1);

    const currentModel = {
      request: {
        removeColumnByMeta(columnMetadataModel) {
          assert.equal(columnMetadataModel, 'age', 'removeColumnByMeta is called with correct model');
        }
      }
    };

    consumer.send(RequestActions.REMOVE_COLUMN, { currentModel }, 'age');
  });

  test('REMOVE_COLUMN_WITH_PARAMS', function(assert) {
    assert.expect(2);

    const currentModel = {
      request: {
        removeColumnByMeta(columnMetadataModel, parameters) {
          assert.equal(columnMetadataModel, 'revenue', 'removeColumnByMeta is called with correct model');
          assert.deepEqual(parameters, { currency: 'USD' }, 'removeColumnByMeta is called with correct params');
        }
      }
    };

    consumer.send(RequestActions.REMOVE_COLUMN_WITH_PARAMS, { currentModel }, 'revenue', { currency: 'USD' });
  });

  test('REMOVE_COLUMN_FRAGMENT', function(assert) {
    assert.expect(1);

    const column = { type: 'dimension', field: 'age' };
    const currentModel = {
      request: {
        removeColumn(columnFragment) {
          assert.deepEqual(columnFragment, column, 'removeColumn is called with correct column fragment');
        }
      }
    };

    consumer.send(RequestActions.REMOVE_COLUMN_FRAGMENT, { currentModel }, column);
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

    const currentModel = {
      request: {
        columns: arr([{ type: 'metric', alias: '', field: 'clicks', parameters: {} }]),

        renameColumn(column, alias) {
          assert.deepEqual(column, currentModel.request.columns[0], 'The correct column is passed in');
          assert.deepEqual(alias, 'Number', 'The alias is Number');
        }
      }
    };

    consumer.send(RequestActions.RENAME_COLUMN_FRAGMENT, { currentModel }, currentModel.request.columns[0], 'Number');
  });

  test('REORDER_COLUMN_FRAGMENT', function(assert) {
    assert.expect(2);

    const currentModel = {
      request: {
        columns: arr([{ field: 'clicks0' }, { field: 'clicks1' }, { field: 'clicks2' }, { field: 'clicks3' }]),

        reorderColumn(column, index) {
          assert.deepEqual(column, currentModel.request.columns[2], 'The correct column is passed in');
          assert.deepEqual(index, index, 'The alias is Number');
        }
      }
    };

    consumer.send(RequestActions.REORDER_COLUMN_FRAGMENT, { currentModel }, currentModel.request.columns[2], 1);
  });

  test('ADD_METRIC_FILTER', function(assert) {
    assert.expect(4);

    const currentModel = {
      request: {
        columns: [{ type: 'metric', columnMetadata: 'pageViews' }]
      }
    };

    //existing column should not be added
    consumer.send(RequestActions.ADD_METRIC_FILTER, { currentModel }, 'pageViews');

    consumer.send(RequestActions.ADD_METRIC_FILTER, { currentModel }, 'adClicks');
    assert.deepEqual(dispatchedActions, [RequestActions.ADD_COLUMN], 'ADD_COLUMN is dispatched');
    assert.deepEqual(
      dispatchedActionArgs,
      ['adClicks'],
      'ADD_COLUMN is dispatched with the correct metric metadata model'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer.send(RequestActions.ADD_METRIC_FILTER, { currentModel }, 'revenue', { currency: 'USD' });
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
      dimensions: ['age'],
      metrics: ['adClicks']
    };
    const currentModel = {
      request: {
        columns: arr([
          { columnMetadata: 'age' },
          { columnMetadata: 'browser' },
          { columnMetadata: 'adClicks' },
          { columnMetadata: 'pageViews' }
        ])
      }
    };

    consumer.send(RequestActions.DID_UPDATE_TABLE, { currentModel }, table);

    assert.deepEqual(
      dispatchedActions,
      [RequestActions.REMOVE_COLUMN, RequestActions.REMOVE_COLUMN],
      'REMOVE_COLUMN is dispatched for each column that is not in the new table'
    );
    assert.deepEqual(
      dispatchedActionArgs,
      ['browser', 'pageViews'],
      'REMOVE_COLUMN is called with the correct metadata model'
    );
  });
});
