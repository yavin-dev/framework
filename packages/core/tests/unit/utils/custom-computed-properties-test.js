import EmberObject, { set, get } from '@ember/object';
import { module, test } from 'qunit';
import { computedSetDiff } from 'navi-core/utils/custom-computed-properties';

module('Unit | Utils | Custom Computed Properties Utils');

test('computedSetDiff', function(assert) {
  assert.expect(11);

  let testClass = EmberObject.extend({
      setDiffProp: computedSetDiff('setAProperty', 'setBProperty')
    }),
    testInstance = testClass.create({
      setAProperty: [1, 2, 3, 4],
      setBProperty: [2, 4]
    });

  assert.deepEqual(get(testInstance, 'setDiffProp'), [1, 3], 'Returns set operation A-B when B is a subset of A');

  set(testInstance, 'setAProperty', [1, 2, 3, 4]);
  set(testInstance, 'setBProperty', [2, 7]);
  assert.deepEqual(
    get(testInstance, 'setDiffProp'),
    [1, 3, 4],
    'Returns set operation A-B when A and B have overlapping elements'
  );

  set(testInstance, 'setAProperty', [1, 2, 3, 4]);
  set(testInstance, 'setBProperty', [5, 7]);
  assert.deepEqual(
    get(testInstance, 'setDiffProp'),
    [1, 2, 3, 4],
    'Returns set operation A-B when A and B have non-overlapping elements'
  );

  set(testInstance, 'setAProperty', []);
  set(testInstance, 'setBProperty', [2, 7]);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns setA when setA is empty');

  set(testInstance, 'setAProperty', [2, 7]);
  set(testInstance, 'setBProperty', []);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [2, 7], 'Returns setA when setB is empty');

  set(testInstance, 'setAProperty', []);
  set(testInstance, 'setBProperty', []);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns setA when setA and setB are empty');

  set(testInstance, 'setAProperty', []);
  set(testInstance, 'setBProperty', undefined);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns setA when setB is undefined');

  set(testInstance, 'setAProperty', undefined);
  set(testInstance, 'setBProperty', []);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns empty set when setA is undefined');

  set(testInstance, 'setAProperty', undefined);
  set(testInstance, 'setBProperty', [5, 7]);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns empty set when setA is undefined');

  set(testInstance, 'setAProperty', [5, 7]);
  set(testInstance, 'setBProperty', undefined);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [5, 7], 'Returns setA when setB is undefined');

  set(testInstance, 'setAProperty', undefined);
  set(testInstance, 'setBProperty', undefined);
  assert.deepEqual(get(testInstance, 'setDiffProp'), [], 'Returns empty set when setA and setB is undefined');
});
