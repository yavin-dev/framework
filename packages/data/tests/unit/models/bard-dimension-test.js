import { module, test } from 'qunit';
import BardDimension from 'navi-data/models/bard-dimension';

module('Unit | Model | Bard Dimension');

test('toString', function(assert) {
  assert.expect(1);
  let factory = BardDimension.extend().reopenClass({
    dimensionName: 'testDimension'
  });

  assert.equal(
    factory.toString(),
    'dimension model factory: testDimension',
    'toString correctly provides a description of the dimension model factory'
  );
});
