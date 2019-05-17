import { errorMessage } from 'dummy/helpers/error-message';
import { module, test } from 'qunit';

module('Unit | Helper | error message', function() {
  test('Server error', function(assert) {
    let result = errorMessage([{}]);
    assert.equal(result, 'Server Error', 'Helper returns server error message');
  });
});
