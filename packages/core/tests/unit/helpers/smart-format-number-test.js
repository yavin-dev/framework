import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';
import { module, test } from 'qunit';

module('Unit | Helpers | Smart Format Number', function() {
  test('smartFormatNumber', function(assert) {
    assert.expect(17);

    assert.equal(smartFormatNumber([100000]), '100,000', 'Numbers > 100 are formatted properly');

    assert.equal(smartFormatNumber([0]), '0', '0 is formatted properly');

    assert.equal(smartFormatNumber(['0.0000']), '0.00', '0 with decimals is formatted properly');

    assert.equal(smartFormatNumber([50]), '50', 'Numbers between 1 and 100 are formatted properly');

    assert.equal(
      smartFormatNumber(['50.0000']),
      '50.00',
      'Numbers between 1 and 100 given with decimals are formatted properly'
    );

    assert.equal(
      smartFormatNumber([50.635]),
      '50.64',
      'Numbers between 1 and 100 given with decimals are formatted properly'
    );

    assert.equal(smartFormatNumber([0.156123]), '0.1561', 'Numbers between 0.0001 and 1 are formatted properly');

    assert.equal(smartFormatNumber([0.000001234567]), '1.2346e-6', 'Numbers less than 0.0001 are formatted properly');

    assert.equal(smartFormatNumber([null]), '', 'null returns empty string');

    assert.equal(smartFormatNumber([]), '', 'undefined returns empty string');

    assert.equal(smartFormatNumber(['']), '', 'empty string returns empty string');

    assert.equal(
      smartFormatNumber([-123456]),
      '-123,456',
      'Negative Numbers with absolute value > 100 are formatted properly'
    );

    assert.equal(
      smartFormatNumber([-50]),
      '-50',
      'Negative Numbers having absolute value between 1 and 100 are formatted properly'
    );

    assert.equal(
      smartFormatNumber(['-50.00']),
      '-50.00',
      'Negative Numbers having absolute value between 1 and 100 with decimals are formatted properly'
    );

    assert.equal(
      smartFormatNumber(['-50.236']),
      '-50.24',
      'Negative Numbers having absolute value between 1 and 100 with decimals are formatted properly'
    );

    assert.equal(
      smartFormatNumber([-0.156123]),
      '-0.1561',
      'Negative Numbers having absolute value between 0.0001 and 1 are formatted properly'
    );

    assert.equal(
      smartFormatNumber([-0.000001234567]),
      '-1.2346e-6',
      'Negative Numbers having absolute value less than 0.0001 are formatted properly'
    );
  });
});
