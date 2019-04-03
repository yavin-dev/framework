import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | get widget', function(hooks) {
  setupTest(hooks);

  test('getWidget', function(assert) {
    assert.expect(2);

    let store = this.owner.lookup('service:store'),
      getWidget = this.owner.lookup('helper:get-widget');

    run(() => {
      store.push({ data: { id: 2, type: 'dashboard-widget' } });
    });

    assert.equal(getWidget.compute([2]).get('id'), '2', 'widget with given id is returned');

    assert.equal(getWidget.compute([24]), null, 'undefined is returned when no widget has that id');
  });
});
