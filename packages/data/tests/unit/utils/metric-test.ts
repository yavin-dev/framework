import { canonicalizeMetric, hasParameters, serializeParameters } from 'navi-data/utils/metric';
import { module, test } from 'qunit';

module('Unit - Utils - Metrics Utils', function () {
  test('canonicalize metric', function (assert) {
    assert.expect(6);
    assert.equal(canonicalizeMetric({ metric: 'foo' }), 'foo', 'correctly serializes metric with no params');

    assert.equal(
      canonicalizeMetric({ metric: 'foo', parameters: {} }),
      'foo',
      'correctly serializes metric with empty object params'
    );

    assert.equal(
      //@ts-expect-error - null parameters
      canonicalizeMetric({ metric: 'foo', parameters: null }),
      'foo',
      'correctly serializes metric with null object params'
    );

    assert.equal(
      canonicalizeMetric({ metric: 'foo', parameters: { p1: '100' } }),
      'foo(p1=100)',
      'correctly serializes metric with one param'
    );

    assert.equal(
      canonicalizeMetric({ metric: 'foo', parameters: { p1: '100', a: '12' } }),
      'foo(a=12,p1=100)',
      'correctly serializes metric with multiple params'
    );

    assert.equal(
      //@ts-expect-error - null parameter value
      canonicalizeMetric({ metric: 'ham', parameters: { p1: 'value', p2: null } }),
      'ham(p1=value)',
      'Do not send parameters with null or undefined values'
    );
  });

  test('has parameters check', function (assert) {
    assert.expect(5);
    assert.equal(hasParameters({ metric: 'foo' }), false, 'metric with no params');

    assert.equal(hasParameters({ metric: 'foo', parameters: {} }), false, 'metric with empty object params');

    //@ts-expect-error - null parameters
    assert.equal(hasParameters({ metric: 'foo', parameters: null }), false, 'metric with null object params');

    assert.equal(hasParameters({ metric: 'foo', parameters: { p1: '100' } }), true, 'metric with one param');

    assert.equal(hasParameters({ metric: 'foo', parameters: { p1: '100', a: '12' } }), true, 'multiple params');
  });

  test('serialize parameters check', function (assert) {
    assert.expect(3);
    assert.equal(serializeParameters({}), '', 'metric with no params');

    assert.equal(serializeParameters({ b: 1, c: 2, a: 3 }), 'a=3,b=1,c=2', 'metric with multiple parameters');

    assert.equal(serializeParameters({ currency: 'USD' }), 'currency=USD', 'metric with single parameters');
  });
});
