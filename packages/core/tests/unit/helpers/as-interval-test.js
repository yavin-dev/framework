import { module, test } from 'qunit';
import Interval from 'navi-core/utils/classes/interval';
import { asInterval } from 'navi-core/helpers/as-interval';

module('Unit | Helper | as interval', function() {
  test('interval object returned from interval object or interval string', function(assert) {
    assert.expect(5);
    const expectedInterval = Interval.parseFromStrings('2018-10-31', '2018-11-01');

    assert.ok(
      expectedInterval.isEqual(asInterval(['2018-10-31/2018-11-01'])),
      'Interval string is turned into an interval class instance'
    );
    assert.ok(expectedInterval.isEqual(asInterval([expectedInterval])), 'Interval class instance is passed through');

    assert.equal(asInterval(['']), '', 'Empty string is passed through');

    assert.notOk(asInterval([undefined]), 'Undefined is passed through');

    assert.notOk(asInterval([null]), 'Null value is passed through');
  });
});
