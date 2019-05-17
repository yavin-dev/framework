import { stringContains } from 'dummy/helpers/string-contains';
import { module, test } from 'qunit';

module('Unit | Helper | string contains', function() {
  test('it works', function(assert) {
    assert.expect(2);

    let result = stringContains('navi_user', 'user');
    assert.ok(result, 'stringContains returns true when substring is part of the string');

    result = stringContains('navi_user', 'midna');
    assert.notOk(result, 'stringContains returns false when substring is not part of the string');
  });
});
