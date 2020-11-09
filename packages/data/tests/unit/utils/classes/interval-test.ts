import Interval from 'navi-data/utils/classes/interval';
import Duration from 'navi-data/utils/classes/duration';
import { module, test } from 'qunit';
import { getIsoDateTimePeriod } from 'navi-data/utils/date';
import moment, { Moment } from 'moment';

const FORMAT = 'YYYY-MM-DD';

module('Unit | Utils | Interval Class', function() {
  test('Construction', function(assert) {
    assert.expect(5);

    //@ts-expect-error
    assert.throws(() => new Interval(), 'error is thrown while constructing with an undefined start');

    //@ts-expect-error
    assert.throws(() => new Interval('current'), 'error is thrown while constructing with an undefined end');

    assert.throws(
      //@ts-expect-error
      () => new Interval('current', { a: 23 }),
      'error is thrown while constructing with an unaccepted object type'
    );

    assert.throws(
      //@ts-expect-error
      () => new Interval(new Duration('P1W'), new Duration('P12W')),
      'error is thrown while constructing with an interval composed of two durations'
    );

    assert.ok(new Interval(new Duration('P7D'), moment()), 'proper interval can be built');
  });

  test('isEqual', function(assert) {
    assert.expect(4);

    let interval = new Interval(new Duration('P7D'), moment());

    assert.notOk(interval.isEqual(), 'Interval does not equal undefined');

    assert.notOk(
      interval.isEqual(new Interval(new Duration('P14W'), moment().subtract(3, 'weeks'))),
      'Interval does not equal interval with different start/end'
    );

    assert.notOk(
      interval.isEqual(new Interval(moment().subtract(7, 'days'), 'current')),
      'Interval does not equal interval with similar dates, but different types'
    );

    assert.ok(interval.isEqual(interval), 'Interval equals one with matching start/end');
  });

  test('isAscending', function(assert) {
    assert.expect(3);

    assert.ok(
      new Interval(new Duration('P7D'), 'current').isAscending(),
      'Interval is ascending when start is before end using duration and macro'
    );

    assert.ok(
      new Interval(moment('2014-10-10', FORMAT), moment('2015-10-10', FORMAT)).isAscending(),
      'Interval is ascending when start is before end using moments'
    );

    assert.notOk(
      new Interval(moment('2015-10-10', FORMAT), moment('2012-10-10', FORMAT)).isAscending(),
      'Interval is not ascending when start is after end'
    );
  });

  test('diffForTimePeriod', function(assert) {
    assert.expect(8);

    assert.equal(
      new Interval(new Duration('P7D'), 'current').diffForTimePeriod('day'),
      7,
      'Interval has 7 days for current til 7 days ago'
    );

    assert.equal(
      new Interval(moment('2014-10-10'), moment('2015-10-10')).diffForTimePeriod('day'),
      365,
      'Interval has 365 days for a 1 year period'
    );

    assert.equal(
      new Interval(moment('2015-11-09 00:00:00.000'), moment('2015-11-10 10:00:00.000')).diffForTimePeriod('hour'),
      34,
      'Interval has 34 hours for a 1 day 10 hour time period'
    );

    assert.equal(
      new Interval(moment('2015-11-09'), moment('2015-11-10')).diffForTimePeriod('day'),
      1,
      'Interval has 1 day for a 1 day period'
    );

    assert.equal(
      new Interval('current', 'next').diffForTimePeriod('day'),
      1,
      'Interval has 1 day for current til next'
    );

    assert.equal(
      new Interval(moment('2015-11-10 10:00:00.000'), moment('2015-11-10 11:00:00.000')).diffForTimePeriod('hour'),
      1,
      'Interval has 1 hour for a 1 hour period'
    );

    assert.equal(
      new Interval(moment('2015-11-10 10:00:00.000'), moment('2015-11-10 11:00:00.000')).diffForTimePeriod('all'),
      1,
      "Interval has 'all' timeGrain and 1 time bucket for 1 hour timePeriod"
    );

    assert.equal(
      new Interval(moment('2015-11-10 10:00:00.000'), moment('2015-11-13 11:00:00.000')).diffForTimePeriod('all'),
      1,
      "Interval has 'all' timeGrain and 1 time bucket for all timePeriod multiple time buckets"
    );
  });

  test('getDatesForInterval', function(assert) {
    assert.expect(2);

    let testInterval = new Interval(moment('4-9-2017', 'D-M-Y'), moment('25-9-2017', 'D-M-Y')),
      dates = testInterval.getDatesForInterval('week');

    assert.deepEqual(
      dates.map(date => date.format('D-M-Y')),
      ['4-9-2017', '11-9-2017', '18-9-2017'],
      'A moment for each week between Sep 4 and Sep 25 (exclusive) is returned'
    );

    dates = testInterval.getDatesForInterval('all');
    assert.deepEqual(
      dates.map(date => date.format('D-M-Y')),
      ['4-9-2017'],
      'A moment for all time is returned as the start date'
    );
  });

  test('asMoments', function(assert) {
    assert.expect(3);

    let moments = new Interval(new Duration('P7D'), 'current').asMoments(),
      current = moment(),
      sevenDaysAgo = current.clone().subtract(7, 'days');

    assert.ok(moments.start.isSame(sevenDaysAgo, 'day'), 'Duration is correctly subtracted from end');

    assert.ok(moments.end?.isSame(current, 'day'), 'Macro is correctly substituted');

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT);

    moments = new Interval(start, end).asMoments();

    assert.ok(moments.start.isSame(start) && moments.end?.isSame(end), 'Given moments are correctly returned');
  });

  test('asMomentsForTimePeriod', function(assert) {
    assert.expect(2);

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT),
      moments = new Interval(start, end).asMomentsForTimePeriod('week');

    assert.ok(moments.start.isSame(start.startOf('isoWeek')), 'Start moment is at start of isoWeek');

    assert.ok(moments.end.isSame(end.startOf('isoWeek')), 'End moment is at start of isoWeek');
  });

  test('asMomentsForTimePeriod with current and next for time period', function(assert) {
    assert.expect(1);

    // end is next, which will be undefined as moment
    let moments = new Interval('current', 'next').asMomentsForTimePeriod('week');
    let expected = moments.end.startOf(getIsoDateTimePeriod('week'));

    assert.ok(moments.end.isSame(expected), 'Setting end to next will be computed correctly');
  });

  test('asMomentsForTimePeriod - same start and end date', function(assert) {
    assert.expect(3);

    let start = moment('2017-10-10', FORMAT),
      end = moment('2017-10-10', FORMAT),
      moments = new Interval(start, end).asMomentsForTimePeriod('week');

    assert.equal(moments.start.format(FORMAT), '2017-10-09', 'Start moment is at start of isoWeek');

    assert.equal(moments.end.format(FORMAT), '2017-10-16', 'End moment is at start of next isoWeek');

    moments = new Interval(start, end).asMomentsForTimePeriod('week', false);

    assert.ok(moments.start.isSame(moments.end), 'Start moment is same as end moment');
  });

  test('makeEndExclusiveFor', function(assert) {
    const start = moment('2017-10-10T00:00:00.000Z').utc();
    const end = moment('2017-10-12T01:02:03.004Z').utc();
    const interval = new Interval(start, end);

    assert.equal(
      interval
        .makeEndExclusiveFor('second')
        .asMoments()
        .end?.toISOString(),
      '2017-10-12T01:02:04.000Z',
      'interval is inclusive of the second'
    );
    assert.equal(
      interval
        .makeEndExclusiveFor('minute')
        .asMoments()
        .end?.toISOString(),
      '2017-10-12T01:03:00.000Z',
      'interval is inclusive of the minute'
    );

    assert.equal(
      interval
        .makeEndExclusiveFor('hour')
        .asMoments()
        .end?.toISOString(),
      '2017-10-12T02:00:00.000Z',
      'interval is inclusive of the hour'
    );

    assert.equal(
      interval
        .makeEndExclusiveFor('day')
        .asMoments()
        .end?.toISOString(),
      '2017-10-13T00:00:00.000Z',
      'interval is inclusive of the day'
    );
    assert.equal(
      interval
        .makeEndExclusiveFor('week')
        .asMoments()
        .end?.toISOString(),
      '2017-10-16T00:00:00.000Z',
      'interval is inclusive of the week'
    );
    assert.equal(
      interval
        .makeEndExclusiveFor('month')
        .asMoments()
        .end?.toISOString(),
      '2017-11-01T00:00:00.000Z',
      'interval is inclusive of the month'
    );
    assert.equal(
      interval
        .makeEndExclusiveFor('quarter')
        .asMoments()
        .end?.toISOString(),
      '2018-01-01T00:00:00.000Z',
      'interval is inclusive of the quarter'
    );
    assert.equal(
      interval
        .makeEndExclusiveFor('year')
        .asMoments()
        .end?.toISOString(),
      '2018-01-01T00:00:00.000Z',
      'interval is inclusive of the year'
    );
  });

  test('asIntervalForTimePeriod', function(assert) {
    assert.expect(2);

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT),
      newInterval = new Interval(start, end).asIntervalForTimePeriod('week').asMoments();

    assert.ok(newInterval.start.isSame(start.startOf('isoWeek')), 'Start moment is at start of isoWeek');

    assert.ok(newInterval.end?.isSame(end.startOf('isoWeek')), 'End moment is at start of isoWeek');
  });

  test('asIntervalForTimePeriod - same start and end date', function(assert) {
    assert.expect(2);

    let start = moment('2017-10-10', FORMAT),
      end = moment('2017-10-10', FORMAT),
      newInterval = new Interval(start, end).asIntervalForTimePeriod('week').asMoments();

    assert.equal(newInterval.start.format(FORMAT), '2017-10-09', 'Start moment is at start of isoWeek');

    assert.equal(newInterval.end?.format(FORMAT), '2017-10-16', 'End moment is at start of isoWeek');
  });

  test('asStrings', function(assert) {
    assert.expect(3);

    let strings = new Interval(new Duration('P7D'), 'current').asStrings();

    assert.equal(strings.start, 'P7D', 'Duration is converted to iso string');

    assert.equal(strings.end, 'current', 'Macro keeps original value');

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT);

    strings = new Interval(start, end).asStrings();

    assert.equal(strings.start, start.format('YYYY-MM-DD HH:mm:ss.SSS'), 'Moments are formatted for API');
  });

  test('_stringFromProperty', function(assert) {
    assert.expect(3);

    assert.equal(Interval['_stringFromProperty'](new Duration('P7D')), 'P7D', 'Duration is converted to iso string');

    assert.equal(Interval['_stringFromProperty']('current'), 'current', 'Macro keeps original value');

    let start = moment('2014-10-10', FORMAT);
    assert.equal(
      Interval['_stringFromProperty'](start),
      start.format('YYYY-MM-DD HH:mm:ss.SSS'),
      'Moments are formatted for API'
    );
  });

  test('fromString', function(assert) {
    assert.expect(5);

    assert.equal(Interval.fromString('current'), 'current', 'Macro can be parsed from string');

    assert.ok(
      (Interval.fromString('P7D') as Duration).isEqual(new Duration('P7D')),
      'Duration can be parsed from iso string'
    );

    assert.ok(
      (Interval.fromString('2014-10-10 00:00:00.000') as Moment).isSame(moment('2014-10-10', FORMAT)),
      'Moments can be parsed from API date string'
    );

    assert.throws(
      () => {
        Interval.fromString('not any valid date');
      },
      /Cannot parse string/,
      'Unrecognized string throws error'
    );

    assert.throws(
      () => {
        //@ts-expect-error
        Interval.fromString(123);
      },
      /Argument must be a string/,
      'Throws error when not given a string'
    );
  });

  test('_isAcceptedType', function(assert) {
    assert.expect(4);

    let interval = new Interval('current', 'current');

    assert.ok(interval['_isAcceptedType'](new Duration('P7D')), 'Duration are accepted');

    assert.ok(interval['_isAcceptedType']('current'), 'String macros are accepted');

    assert.ok(interval['_isAcceptedType'](moment('2014-10-10', FORMAT)), 'Moments are accepted');

    assert.notOk(interval['_isAcceptedType']({ random: 'object' }), 'Generic objects are not accepted');
  });

  test('isInterval', function(assert) {
    assert.expect(2);

    assert.ok(Interval.isInterval(new Interval('current', 'current')), 'isInterval returns true for intervals');

    assert.notOk(Interval.isInterval({ random: 'object' }), 'isInterval returns false for anything else');
  });
});
