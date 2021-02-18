import { formatDimension } from '../../../helpers/format-dimension';
import { module, test } from 'qunit';

module('Unit | Helper | format dimension', function () {
  test('Formatted id', function (assert) {
    assert.expect(6);

    let testDim = {
      id: 'rainbow_road',
      description: 'Rainbow Road',
    };

    assert.equal(
      formatDimension([testDim]),
      'Rainbow Road (rainbow_road)',
      'Id was formatted with () with no field given'
    );

    testDim.description = undefined;
    assert.equal(formatDimension([testDim]), 'rainbow_road', 'Undefined description formats to just the Id');

    testDim.id = undefined;
    testDim.description = undefined;
    assert.equal(formatDimension([testDim]), '', 'Undefined Id and Description formats to just blank string');

    assert.equal(formatDimension([]), '', 'Undefined dimension formats to blank string');

    let fieldDim = {
      id: 'moo_moo_meadows',
      description: 'Moo Moo Meadows',
      nickname: 'Cowabunga',
    };
    assert.equal(
      formatDimension([fieldDim, 'nickname']),
      'Moo Moo Meadows (Cowabunga)',
      'Passed in field is used as the id'
    );
    fieldDim.description = null;
    assert.equal(formatDimension([fieldDim, 'nickname']), 'Cowabunga', 'Field value is used if no description exists');
  });
});
