import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ActionConsumer from 'navi-core/consumers/action-consumer';

module('Unit | Helper | dashboard action', function(hooks) {
  setupTest(hooks);

  test('dashboard action', function(assert) {
    assert.expect(4);

    this.owner.register(
      'consumer:dashboard/filter',
      ActionConsumer.extend({
        send(actionType, ...params) {
          assert.equal(
            actionType,
            'updateFilter',
            'consumer receives the correct action from the dashboard-action helper'
          );

          assert.deepEqual(
            params,
            [{ rawValues: ['test'] }],
            'consumer receives the correct params from the dashboard-action helper'
          );
        }
      })
    );

    const helper = this.owner.factoryFor('helper:dashboard-action').create();
    let action = helper.compute([
      'UPDATE_FILTER',
      {
        rawValues: ['test']
      }
    ]);

    assert.equal(typeof action, 'function', 'The helper returns a function that dispatches the desired action');

    action();

    assert.throws(
      () => helper.compute(['Invalid']),
      /The action name "Invalid" is not a valid dashboard action/,
      'An invalid action name throws an exception'
    );
  });
});
