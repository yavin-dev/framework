import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import config from 'ember-get-config';

module('Unit | Consumer | request table', function(hooks) {
  setupTest(hooks);

  test('UPDATE_TABLE', function(assert) {
    assert.expect(8);

    const table = 'oldTable';
    const currentModel = {
      request: {
        table,
        dataSource: 'oldDataSource',
        timeGrain: 'week'
      }
    };
    const newTable = {
      name: 'newTable',
      timeGrains: [{ id: 'day' }, { id: 'week' }],
      source: 'newDataSource'
    };

    const actionNames = [];
    const args = [];
    const MockDispatcher = {
      dispatch(action, route, arg) {
        actionNames.push(action);
        args.push(arg);
      }
    };

    const subject = this.owner.factoryFor('consumer:request/table').create({ requestActionDispatcher: MockDispatcher });

    //Old and new tables share a time grain
    subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
    assert.deepEqual(
      actionNames,
      [RequestActions.ADD_TIME_GRAIN, RequestActions.DID_UPDATE_TABLE],
      'actions are dispatched in correct order'
    );
    assert.deepEqual(args, [{ id: 'week' }, newTable], 'actions are dispatched with correct args');
    assert.equal(currentModel.request.table, newTable, 'UPDATE_TABLE updates the table request attribute');
    assert.equal(
      currentModel.request.dataSource,
      'newDataSource',
      'UPDATE_TABLE updates the dataSource request attribute'
    );

    actionNames.length = 0;
    args.length = 0;

    //New table doesn't have old table's time grain but has the default time grain
    newTable.timeGrains = [{ id: 'month' }, { id: config.navi.defaultTimeGrain }];
    subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
    assert.deepEqual(
      actionNames,
      [RequestActions.ADD_TIME_GRAIN, RequestActions.DID_UPDATE_TABLE],
      'actions are dispatched in correct order'
    );
    assert.deepEqual(
      args,
      [{ id: config.navi.defaultTimeGrain }, newTable],
      'actions are dispatched with correct args'
    );

    actionNames.length = 0;
    args.length = 0;

    //New table doesn't have old table's time grain and the default time grain
    newTable.timeGrains = [{ id: 'month' }];
    subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
    assert.deepEqual(
      actionNames,
      [RequestActions.ADD_TIME_GRAIN, RequestActions.DID_UPDATE_TABLE],
      'actions are dispatched in correct order'
    );
    assert.deepEqual(args, [{ id: 'month' }, newTable], 'actions are dispatched with correct args');
  });
});
