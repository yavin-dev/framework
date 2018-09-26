import { formatDimension } from '../../../helpers/format-dimension';
import { module, test } from 'qunit';

module('Unit | Helper | format dimension');

test('Formatted id', function(assert) {
  assert.expect(4);

  let testDim = {
    id: 'rainbow_road',
    description: 'Rainbow Road'
  };

  assert.equal(formatDimension([testDim]), 'Rainbow Road (rainbow_road)', 'Id was formatted with ()');

  testDim.description = undefined;
  assert.equal(formatDimension([testDim]), 'rainbow_road', 'Undefined description formats to just the Id');

  testDim.id = undefined;
  testDim.description = undefined;
  assert.equal(formatDimension([testDim]), '', 'Undefined Id and Description formats to just blank string');

  assert.equal(formatDimension([]), '', 'Undefined dimension formats to blank string');
});
