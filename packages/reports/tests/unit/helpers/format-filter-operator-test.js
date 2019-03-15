import { formatFilterOperator } from '../../../helpers/format-filter-operator';
import { module, test } from 'qunit';

module('Unit | Helper | format filter operator', function() {
  test('Invalid and No operator', function(assert) {
    assert.expect(3);

    assert.ok(formatFilterOperator, 'Helper is present');

    assert.throws(
      function() {
        formatFilterOperator([]);
      },
      /^Error.*id: `undefined` should be of type string and non-empty$/,
      'Helper throws error `id: undefined should be of type string and non-empty`'
    );

    assert.throws(
      function() {
        formatFilterOperator(['']);
      },
      /^Error.*id: `` should be of type string and non-empty$/,
      'Helper throws error `id:  should be of type string and non-empty` when id is empty'
    );
  });

  test('Valid operator', function(assert) {
    assert.expect(4);

    assert.equal(formatFilterOperator(['in']), 'Equals', 'Helper returns `Equals` as expected when operator is `in`');

    assert.equal(
      formatFilterOperator(['notin']),
      'Not Equals',
      'Helper returns `Not Equals` as expected when operator is `notin`'
    );

    assert.equal(
      formatFilterOperator(['null']),
      'Is Empty',
      'Helper returns `Is Empty` as expected when operator is `null`'
    );

    assert.equal(
      formatFilterOperator(['notnull']),
      'Is Not Empty',
      'Helper returns `Is Not Empty` as expected when operator is `notnull`'
    );
  });
});
