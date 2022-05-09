import { module, test } from 'qunit';
import { getTranslation } from '@yavin/c3/utils/chart';

module('Unit | Utils | Chart', function () {
  test('test get translation', function (assert) {
    assert.deepEqual(getTranslation('matrix(1,2,3,4,5,6)'), { x: 5, y: 6 }, 'calculates correctly from matrix');
    assert.deepEqual(getTranslation('translate(-36 45.5)'), { x: -36, y: 45.5 }, 'calculates correctly from rotate');
    assert.deepEqual(
      getTranslation('translate(-36 45.5) skewX(40)'),
      { x: -36, y: 45.5 },
      'calculates correctly from multiple transforms'
    );
  });
});
