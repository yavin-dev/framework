import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | pick inner component', function(hooks) {
  setupTest(hooks);

  test('componentName must be defined', function(assert) {
    assert.expect(2);

    const componentIdentifier = 'component:pick-inner-component';

    assert.throws(
      () => {
        this.owner.factoryFor(componentIdentifier).create();
      },
      new Error('Assertion Failed: componentName property must be defined'),
      'pick-inner-component throws error when used without extending'
    );

    const originalComponent = this.owner.factoryFor(componentIdentifier);
    const newComponent = originalComponent.class.extend({
      componentName: 'my-fancy-component',
      _updateTarget() {} // Mock this to isolate test
    });
    this.owner.unregister(componentIdentifier);
    this.owner.register(componentIdentifier, newComponent);
    this.owner.factoryFor(componentIdentifier).create();
    assert.ok(true, 'No error is thrown when component is extended with a new componentName');

    this.owner.unregister(componentIdentifier);
    this.owner.register(componentIdentifier, originalComponent);
  });
});
