import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { getOwner } from '@ember/application';

module('Unit | Model | native with create', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const factory = this.owner.factoryFor('model:native-with-create');
    assert.ok(factory, 'Factory is found');
    const instance = factory.create({});
    assert.ok(instance, 'Factory can create classes');
    assert.ok(getOwner(instance), 'Classes have owners');
  });
});
