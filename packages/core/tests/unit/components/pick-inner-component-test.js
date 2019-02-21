import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | pick inner component', function(hooks) {
  setupTest(hooks);

  test('componentName must be defined', function(assert) {
    assert.expect(2);

    assert.throws(
      () => {
        this.owner.factoryFor('component:pick-inner-component').create();
      },
      new Error('Assertion Failed: componentName property must be defined'),
      'pick-inner-component throws error when used without extending'
    );

    this.owner.factoryFor('component:pick-inner-component').create({
      componentName: 'my-fancy-component',
      _updateTarget() {} // Mock this to isolate test
    });
    assert.ok(true, 'No error is thrown when component is extended with a new componentName');
  });
});
