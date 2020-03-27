import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

module('Unit | Consumer | request logical table', function(hooks) {
  setupTest(hooks);

  test('UPDATE_TABLE', function(assert) {
    assert.expect(9);

    const logicalTable = { table: 'oldTable', timeGrain: 'day' };
    const currentModel = { request: { logicalTable, dataSource: 'oldDataSource' } };
    const newTable = { name: 'newTable', timeGrains: ['day', 'week'], source: 'newDataSource' };

    let expectTableAction = false;

    const MockDispatcher = {
      dispatch(action, route, arg) {
        if (expectTableAction) {
          assert.equal(action, RequestActions.DID_UPDATE_TABLE, 'DID_UPDATE_TABLE is sent as part of UPDATE_TABLE');
          assert.deepEqual(arg, newTable, 'New table is passed to DID_UPDATE_TABLE');
          expectTableAction = false;
        } else {
          assert.equal(action, RequestActions.ADD_TIME_GRAIN, 'ADD_TIME_GRAIN is sent as part of UPDATE_TABLE');

          assert.equal(
            arg,
            'day',
            'When the old and new tables share a time grain, that grain is given to ADD_TIME_GRAIN'
          );
          expectTableAction = true;
        }
      }
    };
    const subject = this.owner
      .factoryFor('consumer:request/logical-table')
      .create({ requestActionDispatcher: MockDispatcher });

    /* == Old + New tables share a time grain == */
    subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
    assert.equal(logicalTable.table, newTable, 'UPDATE_TABLE updates the table field on a logical table');
    assert.equal(currentModel.request.dataSource, 'newDataSource');

    /* == New table has different time grains == */
    newTable.timeGrains = ['week'];
    MockDispatcher.dispatch = (action, route, arg) => {
      if (expectTableAction) {
        assert.equal(action, RequestActions.DID_UPDATE_TABLE, 'DID_UPDATE_TABLE is sent as part of UPDATE_TABLE');
        assert.deepEqual(arg, newTable, 'New table is passed to DID_UPDATE_TABLE');
        expectTableAction = false;
      } else {
        assert.equal(
          arg,
          'week',
          "When new table doesn't have previous time grain, the first grain is given to ADD_TIME_GRAIN"
        );
        expectTableAction = true;
      }
    };
    subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
  });
});
