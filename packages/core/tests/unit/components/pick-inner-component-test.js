import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'pick-inner-component',
  'Unit | Component | pick inner component',
  {
    unit: true
  }
);

test('componentName must be defined', function(assert) {
  assert.expect(2);

  assert.throws(
    () => {
      this.subject();
    },
    new Error('Assertion Failed: componentName property must be defined'),
    'pick-inner-component throws error when used without extending'
  );

  this.subject({
    componentName: 'my-fancy-component',
    _updateTarget() {} // Mock this to isolate test
  });
  assert.ok(
    true,
    'No error is thrown when component is extended with a new componentName'
  );
});
