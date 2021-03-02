import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | get widget', function (hooks) {
  setupTest(hooks);

  test('getWidget', function (assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store');
    const getWidget = this.owner.factoryFor('helper:get-widget').create();

    store.push({ data: { id: 2, type: 'dashboard-widget' } });

    assert.equal(getWidget.compute([2]).get('id'), '2', 'widget with given id is returned');
    assert.equal(getWidget.compute([24]), null, 'null is returned when no widget has that id');
  });
});
