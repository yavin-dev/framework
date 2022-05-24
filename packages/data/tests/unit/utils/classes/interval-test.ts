import Interval from 'navi-data/utils/classes/interval';
import Duration from '@yavin/client/utils/classes/duration';
import { module, test } from 'qunit';
import { getPeriodForGrain, Grain } from 'navi-data/utils/date';
import moment, { Moment } from 'moment';

const FORMAT = 'YYYY-MM-DD';

module('Unit | Utils | Interval Class', function () {
  test('Construction', function (assert) {
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

  test('isEqual', function (assert) {
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

  test('diffForTimePeriod', function (assert) {
    assert.expect(7);

    assert.equal(
      new Interval(new Duration('P1D'), moment.utc('2021-02-05')).diffForTimePeriod('day'),
      1,
      'Interval has 1 days for absolute day to 1 day ago'
    );

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
  });

  test('getDatesForInterval', function (assert) {
    assert.expect(1);

    let testInterval = new Interval(moment('4-9-2017', 'D-M-Y'), moment('25-9-2017', 'D-M-Y')),
      dates = testInterval.getDatesForInterval('isoWeek');

    assert.deepEqual(
      dates.map((date) => date.format('D-M-Y')),
      ['4-9-2017', '11-9-2017', '18-9-2017'],
      'A moment for each isoWeek between Sep 4 and Sep 25 (exclusive) is returned'
    );
  });

  test('_asMoments', function (assert) {
    let moments = new Interval(new Duration('P7D'), 'current')['_asMoments']('day'),
      current = moment(),
      sevenDaysAgo = current.clone().subtract(7, 'days');

    assert.ok(moments.start.isSame(sevenDaysAgo, 'day'), 'Duration is correctly subtracted from end (1)');

    assert.ok(moments.end?.isSame(current, 'day'), 'Current macro is correctly substituted');

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT);

    moments = new Interval(start, end)['_asMoments']('day');

    assert.ok(moments.start.isSame(start) && moments.end?.isSame(end), 'Given moments are correctly returned');

    moments = new Interval(new Duration('P2M'), 'next')['_asMoments']('day');
    let next = moment().add(1, 'days'),
      twoMonthsBeforeNext = next.clone().subtract(2, 'months');

    assert.ok(moments.start.isSame(twoMonthsBeforeNext, 'day'), 'Duration is correctly subtracted from end (2)');

    assert.ok(moments.end?.isSame(next, 'day'), 'Next macro is correctly substituted');
  });

  test('asMomentsForTimePeriod', function (assert) {
    assert.expect(2);

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT),
      moments = new Interval(start, end).asMomentsForTimePeriod('isoWeek');

    assert.ok(moments.start.isSame(start.startOf('isoWeek')), 'Start moment is at start of isoWeek');

    assert.ok(moments.end.isSame(end.startOf('isoWeek')), 'End moment is at start of isoWeek');
  });

  test('asMomentsForTimePeriod with current and next for time period', function (assert) {
    assert.expect(1);

    // end is next, which will be undefined as moment
    let moments = new Interval('current', 'next').asMomentsForTimePeriod('isoWeek');
    let expected = moments.end.startOf(getPeriodForGrain('isoWeek'));

    assert.ok(moments.end.isSame(expected), 'Setting end to next will be computed correctly');
  });

  test('asMomentsForTimePeriod - same start and end date', function (assert) {
    assert.expect(3);

    let start = moment('2017-10-10', FORMAT),
      end = moment('2017-10-10', FORMAT),
      moments = new Interval(start, end).asMomentsForTimePeriod('isoWeek');

    assert.equal(moments.start.format(FORMAT), '2017-10-09', 'Start moment is at start of isoWeek');

    assert.equal(moments.end.format(FORMAT), '2017-10-16', 'End moment is at start of next isoWeek');

    moments = new Interval(start, end).asMomentsForTimePeriod('isoWeek', false);

    assert.ok(moments.start.isSame(moments.end), 'Start moment is same as end moment');
  });

  test('asMomentsInclusive', function (assert) {
    assert.expect(8);

    const toInclusive = (startStr: string, endStr: string, grain: Grain) => {
      const { start, end } = Interval.parseFromStrings(startStr, endStr).asMomentsInclusive(grain);
      return [start.toISOString(), end.toISOString()];
    };
    const startStr = '2014-01-01';
    const endStr = '2015-01-01';
    const startValue = `${startStr}T00:00:00.000Z`;
    assert.deepEqual(
      toInclusive(startStr, endStr, 'second'),
      [startValue, '2014-12-31T23:59:59.000Z'],
      'End moment is inclusive of the second'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'minute'),
      [startValue, '2014-12-31T23:59:00.000Z'],
      'End moment is inclusive of the minute'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'hour'),
      [startValue, '2014-12-31T23:00:00.000Z'],
      'End moment is inclusive of the hour'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'day'),
      [startValue, '2014-12-31T00:00:00.000Z'],
      'End moment is inclusive of the day'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'isoWeek'),
      ['2013-12-30T00:00:00.000Z', '2014-12-22T00:00:00.000Z'],
      'End moment is inclusive of the isoWeek and aligned to isoWeek'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'month'),
      [startValue, '2014-12-01T00:00:00.000Z'],
      'End moment is inclusive of the month'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'quarter'),
      [startValue, '2014-10-01T00:00:00.000Z'],
      'End moment is inclusive of the quarter'
    );
    assert.deepEqual(
      toInclusive(startStr, endStr, 'year'),
      [startValue, '2014-01-01T00:00:00.000Z'],
      'End moment is inclusive of the year'
    );
  });

  test('makeEndExclusiveFor', function (assert) {
    const start = moment('2017-10-10T00:00:00.000Z').utc();
    const end = moment('2017-10-12T01:02:03.004Z').utc();
    const interval = new Interval(start, end);

    assert.equal(
      interval.makeEndExclusiveFor('second')['_asMoments']('second').end?.toISOString(),
      '2017-10-12T01:02:04.000Z',
      'interval is inclusive of the second'
    );
    assert.equal(
      interval.makeEndExclusiveFor('minute')['_asMoments']('minute').end?.toISOString(),
      '2017-10-12T01:03:00.000Z',
      'interval is inclusive of the minute'
    );

    assert.equal(
      interval.makeEndExclusiveFor('hour')['_asMoments']('hour').end?.toISOString(),
      '2017-10-12T02:00:00.000Z',
      'interval is inclusive of the hour'
    );

    assert.equal(
      interval.makeEndExclusiveFor('day')['_asMoments']('day').end?.toISOString(),
      '2017-10-13T00:00:00.000Z',
      'interval is inclusive of the day'
    );
    assert.equal(
      interval.makeEndExclusiveFor('isoWeek')['_asMoments']('week').end?.toISOString(),
      '2017-10-16T00:00:00.000Z',
      'interval is inclusive of the isoWeek'
    );
    assert.equal(
      interval.makeEndExclusiveFor('month')['_asMoments']('month').end?.toISOString(),
      '2017-11-01T00:00:00.000Z',
      'interval is inclusive of the month'
    );
    assert.equal(
      interval.makeEndExclusiveFor('quarter')['_asMoments']('quarter').end?.toISOString(),
      '2018-01-01T00:00:00.000Z',
      'interval is inclusive of the quarter'
    );
    assert.equal(
      interval.makeEndExclusiveFor('year')['_asMoments']('year').end?.toISOString(),
      '2018-01-01T00:00:00.000Z',
      'interval is inclusive of the year'
    );
  });

  test('asIntervalForTimePeriod', function (assert) {
    assert.expect(2);

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT),
      newInterval = new Interval(start, end).asIntervalForTimePeriod('isoWeek')['_asMoments']('week');

    assert.ok(newInterval.start.isSame(start.startOf('isoWeek')), 'Start moment is at start of isoWeek');

    assert.ok(newInterval.end?.isSame(end.startOf('isoWeek')), 'End moment is at start of isoWeek');
  });

  test('asIntervalForTimePeriod - same start and end date', function (assert) {
    assert.expect(2);

    let start = moment('2017-10-10', FORMAT),
      end = moment('2017-10-10', FORMAT),
      newInterval = new Interval(start, end).asIntervalForTimePeriod('isoWeek')['_asMoments']('week');

    assert.equal(newInterval.start.format(FORMAT), '2017-10-09', 'Start moment is at start of isoWeek');

    assert.equal(newInterval.end?.format(FORMAT), '2017-10-16', 'End moment is at start of isoWeek');
  });

  test('asStrings', function (assert) {
    assert.expect(3);

    let strings = new Interval(new Duration('P7D'), 'current').asStrings();

    assert.equal(strings.start, 'P7D', 'Duration is converted to iso string');

    assert.equal(strings.end, 'current', 'Macro keeps original value');

    let start = moment('2014-10-10', FORMAT),
      end = moment('2015-10-10', FORMAT);

    strings = new Interval(start, end).asStrings();

    assert.equal(strings.start, start.toISOString(), 'Moments are formatted for API');
  });

  test('elementToString', function (assert) {
    assert.expect(3);

    assert.equal(Interval.elementToString(new Duration('P7D')), 'P7D', 'Duration is converted to iso string');

    assert.equal(Interval.elementToString('current'), 'current', 'Macro keeps original value');

    let start = moment('2014-10-10', FORMAT);
    assert.equal(Interval.elementToString(start), start.toISOString(), 'Moments are formatted for API');
  });

  test('fromString', function (assert) {
    assert.expect(5);

    assert.equal(Interval.fromString('current'), 'current', 'Macro can be parsed from string');

    assert.ok(
      (Interval.fromString('P7D') as Duration).isEqual(new Duration('P7D')),
      'Duration can be parsed from iso string'
    );

    assert.ok(
      (Interval.fromString('2014-10-10 00:00:00.000') as Moment).isSame(moment.utc('2014-10-10', FORMAT)),
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

  test('_isAcceptedType', function (assert) {
    assert.expect(4);

    let interval = new Interval('current', 'current');

    assert.ok(interval['_isAcceptedType'](new Duration('P7D')), 'Duration are accepted');

    assert.ok(interval['_isAcceptedType']('current'), 'String macros are accepted');

    assert.ok(interval['_isAcceptedType'](moment('2014-10-10', FORMAT)), 'Moments are accepted');

    assert.notOk(interval['_isAcceptedType']({ random: 'object' }), 'Generic objects are not accepted');
  });

  test('isInterval', function (assert) {
    assert.expect(2);

    assert.ok(Interval.isInterval(new Interval('current', 'current')), 'isInterval returns true for intervals');

    assert.notOk(Interval.isInterval({ random: 'object' }), 'isInterval returns false for anything else');
  });
});
