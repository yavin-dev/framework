import { moduleFor, test } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

const DAY = { name: 'day' },
      WEEK = { name: 'week' };

moduleFor('consumer:request/logical-table', 'Unit | Consumer | request logical table', {
  needs: [
    'consumer:action-consumer',
    'service:request-action-dispatcher'
  ],
});

test('UPDATE_TABLE', function(assert) {
  assert.expect(4);

  const MockDispatcher = {
    dispatch(action, route, timeGrain) {
      assert.equal(action,
        RequestActions.ADD_TIME_GRAIN,
        'ADD_TIME_GRAIN is sent as part of UPDATE_TABLE');

      assert.equal(timeGrain,
        DAY,
        'When the old and new tables share a time grain, that grain is given to ADD_TIME_GRAIN');
    }
  };

  let logicalTable = { table: 'oldTable', timeGrain: DAY },
      currentModel = { request: { logicalTable } },
      subject = this.subject({ requestActionDispatcher: MockDispatcher }),
      newTable = { name: 'newTable', timeGrains: [DAY, WEEK] };

  /* == Old + New tables share a time grain == */
  subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
  assert.equal(logicalTable.table,
    newTable,
    'UPDATE_TABLE updates the table field on a logical table');

  /* == New table has different time grains == */
  newTable.timeGrains = [WEEK];
  MockDispatcher.dispatch = (action, route, timeGrain) => {
    assert.equal(timeGrain,
      WEEK,
      'When new table doesn\'t have previous time grain, the first grain is given to ADD_TIME_GRAIN');
  };
  subject.send(RequestActions.UPDATE_TABLE, { currentModel }, newTable);
});
