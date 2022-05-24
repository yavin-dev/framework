import { subtractDurationFromDate } from '@yavin/client/utils/duration-utils';
import Duration from '@yavin/client/utils/classes/duration';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Utils | DurationUtils', function () {
  test('subtractDurationFromDate', function (assert) {
    assert.expect(4);

    let duration = new Duration('P2D');
    let date = moment();
    let expectedResult = date.clone().subtract(2, 'days');

    let result = subtractDurationFromDate(date, duration);
    assert.equal(
      result.format(),
      expectedResult.format(),
      'subtractDurationFromDate returned the appropriate date as expected'
    );
    assert.notEqual(date, result, 'subtractDurationFromDate does not mutate the date param object');

    assert.throws(
      //@ts-expect-error
      () => subtractDurationFromDate('2015-01-01', duration),
      'subtractDurationFromDate throws an error for an invalid date parameter'
    );

    assert.throws(
      //@ts-expect-error
      () => subtractDurationFromDate(date, '2 Days'),
      'subtractDurationFromDate throws an error for an invalid duration parameter'
    );
  });
});
