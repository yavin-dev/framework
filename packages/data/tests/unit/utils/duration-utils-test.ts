import DurationUtils from 'navi-data/utils/duration-utils';
import { getFirstDayEpochForGrain, PARAM_DATE_FORMAT_STRING } from 'navi-data/utils/date';
import Duration from 'navi-data/utils/classes/duration';
import { module, test } from 'qunit';
import moment from 'moment';
import config from 'ember-get-config';

module('Unit | Utils | DurationUtils', function() {
  test('subtractDurationFromDate', function(assert) {
    assert.expect(4);

    let duration = new Duration('P2D');
    let date = moment();
    let expectedResult = date.clone().subtract(2, 'days');

    let result = DurationUtils.subtractDurationFromDate(date, duration);
    assert.equal(
      result.format(),
      expectedResult.format(),
      'subtractDurationFromDate returned the appropriate date as expected'
    );
    assert.notEqual(date, result, 'subtractDurationFromDate does not mutate the date param object');

    assert.throws(
      //@ts-expect-error
      () => DurationUtils.subtractDurationFromDate('2015-01-01', duration),
      'subtractDurationFromDate throws an error for an invalid date parameter'
    );

    assert.throws(
      //@ts-expect-error
      () => DurationUtils.subtractDurationFromDate(date, '2 Days'),
      'subtractDurationFromDate throws an error for an invalid duration parameter'
    );
  });

  test('isDurationOverAYear', function(assert) {
    assert.expect(8);

    assert.throws(
      //@ts-expect-error
      () => DurationUtils.isDurationOverAYear(),
      'isDurationOverAYear throws an error for an undefined duration parameter'
    );

    assert.throws(
      //@ts-expect-error
      () => DurationUtils.isDurationOverAYear('2 Days'),
      'isDurationOverAYear throws an error for an invalid duration parameter'
    );

    let duration = new Duration('P2M');
    assert.throws(
      //@ts-expect-error
      () => DurationUtils.isDurationOverAYear(duration),
      'isDurationOverAYear throws an error for undefined dateTimePeriod parameter'
    );

    assert.equal(
      DurationUtils.isDurationOverAYear(duration, 'month'),
      false,
      'isDurationOverAYear returned false for a duration of 2 months'
    );

    duration = new Duration('P1Y');
    assert.equal(
      DurationUtils.isDurationOverAYear(duration, 'year'),
      false,
      'isDurationOverAYear returned false for a duration of 1 year'
    );

    duration = new Duration('P18M');
    assert.equal(
      DurationUtils.isDurationOverAYear(duration, 'month'),
      true,
      'isDurationOverAYear returned true for a duration of 18 months'
    );

    duration = new Duration('P2Y');
    assert.equal(
      DurationUtils.isDurationOverAYear(duration, 'year'),
      true,
      'isDurationOverAYear returned true for a duration of 2 years'
    );

    assert.equal(
      DurationUtils.isDurationOverAYear(Duration.all(), 'month'),
      true,
      'isDurationOverAYear returned true for all duration'
    );
  });

  test('computeStartOfInterval', function(assert) {
    assert.expect(5);

    /* == valid cases == */

    /* == All Duration == */
    let endDate = moment('2015-01-01', PARAM_DATE_FORMAT_STRING);
    const expectedDate = getFirstDayEpochForGrain('week');
    let startOfInterval = DurationUtils.computeStartOfInterval(endDate, Duration.all(), 'week');
    assert.ok(startOfInterval.isSame(expectedDate), 'computeStartOfInterval returns epoch week for all duration');

    /* == date range does not exceed epoch == */
    endDate = moment('2013-05-01', PARAM_DATE_FORMAT_STRING);
    let expectedMoment = moment(config.navi.dataEpoch, PARAM_DATE_FORMAT_STRING);
    const duration = new Duration('P24M');
    startOfInterval = DurationUtils.computeStartOfInterval(endDate, duration, 'month');
    assert.ok(
      startOfInterval.isSame(expectedMoment),
      'computeStartOfInterval returns epoch if duration goes beyond epoch date'
    );

    /* == date range exceeds epoch == */
    expectedMoment = moment(getFirstDayEpochForGrain('month', PARAM_DATE_FORMAT_STRING), PARAM_DATE_FORMAT_STRING);
    endDate = expectedMoment.clone().add(1, 'month');
    startOfInterval = DurationUtils.computeStartOfInterval(endDate, duration, 'month');
    assert.ok(
      startOfInterval.isSame(expectedMoment),
      'computeStartOfInterval returns epoch month for date range that exceeds epoch'
    );

    /* == invalid cases == */
    assert.throws(
      //@ts-expect-error
      () => DurationUtils.computeStartOfInterval(),
      'computeStartOfInterval throws an error for undefined params'
    );

    assert.throws(
      //@ts-expect-error
      () => DurationUtils.computeStartOfInterval(endDate, 'P2D', 'month'),
      'computeStartOfInterval throws an error for invalid duration param'
    );
  });
});
