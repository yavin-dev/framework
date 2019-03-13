import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Validator | array-number', function(hooks) {
  setupTest(hooks);

  test('validate array-number', function(assert) {
    assert.expect(3);

    let Validator = this.owner.lookup('validator:array-number'),
      badArray0 = A(['', 2]),
      badArray1 = A(['foo', 2, 'bar']),
      message = () => 'Array contents are not numerical';

    assert.equal(
      Validator.validate(badArray0, { message }),
      'Array contents are not numerical',
      'Array has values that are empty'
    );

    assert.equal(
      Validator.validate(badArray1, { message }),
      'Array contents are not numerical',
      'Array has values that are numerical'
    );

    let regArray = A([1, 2, 3]);
    message = () => 'All Array contents are numerical';

    assert.equal(Validator.validate(regArray, { message }), true, 'Array contents are numerical');
  });
});
