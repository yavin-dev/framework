import { canonicalizeColumn, hasParameters, serializeParameters } from '@yavin/client/utils/column';
import { module, test } from 'qunit';

module('Unit | Utils | Column', function () {
  test('canonicalizeColumn', function (assert) {
    assert.expect(6);
    assert.equal(canonicalizeColumn({ field: 'foo' }), 'foo', 'correctly serializes column with no params');

    assert.equal(
      canonicalizeColumn({ field: 'foo', parameters: {} }),
      'foo',
      'correctly serializes column with empty object params'
    );

    assert.equal(
      //@ts-expect-error - null parameters
      canonicalizeColumn({ field: 'foo', parameters: null }),
      'foo',
      'correctly serializes column with null object params'
    );

    assert.equal(
      canonicalizeColumn({ field: 'foo', parameters: { p1: '100' } }),
      'foo(p1=100)',
      'correctly serializes column with one param'
    );

    assert.equal(
      canonicalizeColumn({ field: 'foo', parameters: { p1: '100', a: '12' } }),
      'foo(a=12,p1=100)',
      'correctly serializes column with multiple params'
    );

    assert.equal(
      //@ts-expect-error - null parameter value
      canonicalizeColumn({ field: 'ham', parameters: { p1: 'value', p2: null } }),
      'ham(p1=value)',
      'Do not send parameters with null or undefined values'
    );
  });

  test('hasParameters', function (assert) {
    assert.expect(5);
    assert.equal(hasParameters({ field: 'foo' }), false, 'column with no params');

    assert.equal(hasParameters({ field: 'foo', parameters: {} }), false, 'column with empty object params');

    //@ts-expect-error - null parameters
    assert.equal(hasParameters({ field: 'foo', parameters: null }), false, 'column with null object params');

    assert.equal(hasParameters({ field: 'foo', parameters: { p1: '100' } }), true, 'column with one param');

    assert.equal(hasParameters({ field: 'foo', parameters: { p1: '100', a: '12' } }), true, 'multiple params');
  });

  test('serializeParameters', function (assert) {
    assert.expect(3);
    assert.equal(serializeParameters({}), '', 'column with no params');

    assert.equal(serializeParameters({ b: 1, c: 2, a: 3 }), 'a=3,b=1,c=2', 'column with multiple parameters');

    assert.equal(serializeParameters({ currency: 'USD' }), 'currency=USD', 'column with single parameters');
  });
});
