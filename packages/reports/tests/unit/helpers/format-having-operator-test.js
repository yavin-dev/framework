import { formatHavingOperator } from '../../../helpers/format-having-operator';
import { module, test } from 'qunit';

module('Unit | Helper | format having operator', function() {
  test('Helper exists', function(assert) {
    assert.expect(1);

    assert.ok(formatHavingOperator, 'Helper is present');
  });

  test('Returns expected format for operator', function(assert) {
    assert.expect(2);

    assert.equal(
      formatHavingOperator(['eq']),
      'equals (=)',
      'Helper returns `equals (=)` as expected when operator is `eq`'
    );

    assert.equal(
      formatHavingOperator(['gte']),
      'greater than or equals (>=)',
      'Helper returns `greater than or equals (>=)` as expected when operator is `gte`'
    );
  });
});
