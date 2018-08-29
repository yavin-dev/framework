import { moduleFor, test } from 'ember-qunit';
import { getOwner } from '@ember/application';
import ActionConsumer from 'navi-core/consumers/action-consumer';

let Container;
moduleFor('helper:item-action', 'Unit | Helper | item action', {
  needs: [
    'helper:route-action',
    'service:request-action-dispatcher',
    'service:item-action-dispatcher',
    'service:action-dispatcher'
  ],

  beforeEach() {
    Container = getOwner(this);
  }
});

test('item action', function(assert) {
  assert.expect(4);

  Container.register('consumer:item', ActionConsumer.extend({
    send(actionType, ...params) {
      assert.equal(actionType,
        'deleteItem',
        'consumer receives the correct action from the item-action helper');

      assert.deepEqual(params,
        [{ title: 'Report' }],
        'consumer receives the correct params from the item-action helper');
    }
  }));

  let action = this.subject().compute(['DELETE_ITEM', {
    title: 'Report'
  }]);

  assert.equal(typeof action,
    'function',
    'The helper returns a function that dispatches the desired action');

  action();

  assert.throws(() => this.subject().compute(['Invalid']),
    /The action name "Invalid" is not a valid item action/,
    'An invalid action name throws an exception');
});
