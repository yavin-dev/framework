import { A } from '@ember/array';
import { moduleFor, test } from 'ember-qunit';

moduleFor('validator:array-empty-value', 'Unit | Validator | array-empty-value', {
  needs: ['validator:messages']
});

test('validate array-empty-value', function(assert) {
  assert.expect(3);

  let Validator = this.subject(),
    badArray0 = A(['', 2]),
    badArray1 = A(['foo', 2, null]),
    message = 'Array contains an empty value';

  assert.equal(
    Validator.validate(badArray0, { message }),
    'Array contains an empty value',
    'An array with an empty string is invalid'
  );

  assert.equal(
    Validator.validate(badArray1, { message }),
    'Array contains an empty value',
    'An array with a null value is invalid'
  );

  let regArray = A([1, 2, 3]);
  message = 'All Array contents are non-empty';

  assert.equal(Validator.validate(regArray, { message }), true, 'An array with non-empty values is valid');
});
