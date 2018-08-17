import { moduleFor, test } from 'ember-qunit';
import { getOwner } from '@ember/application';
import ActionConsumer from 'navi-core/consumers/action-consumer';

let Container;
moduleFor('helper:report-action', 'Unit | Helper | report action', {
  needs: [
    'consumer:request/dimension',
    'consumer:request/filter',
    'consumer:request/logical-table',
    'consumer:request/metric',
    'consumer:request/sort',
    'consumer:request/time-grain',
    'consumer:report/table-visualization',
    'helper:route-action',
    'service:request-action-dispatcher',
    'service:report-action-dispatcher',
    'service:action-dispatcher'
  ],

  beforeEach() {
    Container = getOwner(this);
  }
});

test('report action', function(assert) {
  assert.expect(4);

  Container.register('consumer:report/report', ActionConsumer.extend({
    send(actionType, ...params) {
      assert.equal(actionType,
        'deleteReport',
        'consumer receives the correct action from the report-action helper');

      assert.deepEqual(params,
        [{ title: 'Report' }],
        'consumer receives the correct params from the report-action helper');
    }
  }));

  let action = this.subject().compute(['DELETE_REPORT', {
    title: 'Report'
  }]);

  assert.equal(typeof action,
    'function',
    'The helper returns a function that dispatches the desired action');

  action();

  assert.throws(() => this.subject().compute(['Invalid']),
    /The action name "Invalid" is not a valid report action/,
    'An invalid action name throws an exception');
});
