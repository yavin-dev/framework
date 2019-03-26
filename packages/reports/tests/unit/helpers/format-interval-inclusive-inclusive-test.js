import {
  formatInterval,
  formatDurationFromCurrent,
  formatDateRange
} from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import Interval from 'navi-core/utils/classes/interval';
import Duration from 'navi-core/utils/classes/duration';
import { module, test } from 'qunit';
import moment from 'moment';

const FORMAT = 'MM-DD-YYYY';

module('Unit | Helper | format interval inclusive inclusive', function() {
  test('Undefined interval and time period', function(assert) {
    assert.expect(2);

    assert.equal(
      formatInterval([moment(new Interval('current', 'current')), null]),
      '',
      'No time period returns empty string'
    );

    assert.equal(formatInterval([null, 'week']), '', 'No interval returns empty string');
  });

  test('Formatting start and end', function(assert) {
    assert.expect(1);

    let interval = new Interval(new Duration('P4W'), moment('10-14-2014', FORMAT)),
      formattedString = formatInterval([interval, 'week']);

    assert.equal(
      formattedString,
      'Sep 15, 2014 - Oct 12, 2014',
      'Interval was converted to inclusive end date and was correctly formatted'
    );
  });

  test('Formatting rolling window', function(assert) {
    assert.expect(2);

    let interval = new Interval(new Duration('P4W'), 'current'),
      formattedString = formatInterval([interval, 'week']);

    assert.equal(formattedString, 'Last 4 Weeks', 'Interval was converted to week rolling window');

    interval = new Interval(new Duration('P6M'), 'current');
    formattedString = formatInterval([interval, 'quarter']);

    assert.equal(formattedString, 'Last 2 Quarters', 'Interval was converted to quarter rolling window');
  });

  test('Checking Current', function(assert) {
    assert.expect(2);

    let interval = new Interval('current', 'next'),
      formattedString = formatInterval([interval, 'month']);

    assert.equal(formattedString, 'Current Month', 'Interval was converted to Current Month');

    formattedString = formatInterval([interval, 'quarter']);

    assert.equal(formattedString, 'Current Quarter', 'Interval was converted to Current Quarter');
  });

  test('formatDurationFromCurrent', function(assert) {
    assert.expect(7);

    assert.equal(formatDurationFromCurrent(), '', 'No duration returns empty string');

    assert.equal(formatDurationFromCurrent(new Duration('P4W')), 'Last 4 Weeks', 'Last is added to humanized duration');

    assert.equal(
      formatDurationFromCurrent(new Duration('P9M'), 'quarter'),
      'Last 3 Quarters',
      'Quarter is formatted correctly when in terms of a month duration'
    );

    assert.equal(formatDurationFromCurrent(Duration.all()), 'All', 'All duration is kept as All');

    assert.equal(formatDurationFromCurrent(new Duration('P1D')), 'Last Day', '1 day ago becomes Last Day');

    assert.equal(formatDurationFromCurrent(new Duration('P1W')), 'Last Week', 'Value of 1 is removed when formatting');

    assert.equal(
      formatDurationFromCurrent(new Duration('P3M'), 'quarter'),
      'Last Quarter',
      'Value of 1 is removed when formatting quarter'
    );
  });

  test('formatDurationFromCurrent - quarter not in terms of months', function(assert) {
    assert.expect(1);

    assert.throws(
      () => formatDurationFromCurrent(new Duration('P3W'), 'quarter'),
      /Formatting a quarter with a duration must be in terms on months/,
      'Trying to format a quarter grain with a duration other than month throws an error'
    );
  });

  test('formatDateRange - Undefined start and end', function(assert) {
    assert.expect(4);

    let error = new Error('Assertion Failed: Start & End dates and time period  must be defined');

    assert.throws(
      () => {
        formatDateRange();
      },
      error,
      'Providing no arguments throws an error'
    );

    assert.throws(
      () => {
        formatDateRange(moment(), null, null);
      },
      error,
      'Providing valid start, but no end throws an error'
    );

    assert.throws(
      () => {
        formatDateRange(null, moment(), null);
      },
      error,
      'Providing valid end, but no start throws an error'
    );

    assert.throws(
      () => {
        formatDateRange(moment(), moment(), null);
      },
      error,
      'Providing valid start and end, but no timePeriod throws an error'
    );
  });

  test('formatDateRange - Formatting start and end', function(assert) {
    assert.expect(4);

    let formattedString = formatDateRange(moment('09-14-2014', FORMAT), moment('10-14-2014', FORMAT), 'day');
    assert.equal(formattedString, 'Sep 14, 2014 - Oct 14, 2014', 'Given date range was correctly formatted');

    formattedString = formatDateRange(moment('09-01-2014', FORMAT), moment('12-01-2014', FORMAT), 'month');
    assert.equal(
      formattedString,
      'Sep 2014 - Dec 2014',
      'Given month range was correctly formatted with the day truncated'
    );

    formattedString = formatDateRange(moment('01-01-2016', FORMAT), moment('04-01-2016', FORMAT), 'quarter');
    assert.equal(formattedString, 'Q1 2016 - Q2 2016', 'Given quarter range was correctly formatted');

    formattedString = formatDateRange(moment('01-01-2015', FORMAT), moment('01-01-2016', FORMAT), 'year');
    assert.equal(formattedString, '2015 - 2016', 'Given year range was correctly formatted');
  });

  test('formatDateRange - Same start and end dates', function(assert) {
    assert.expect(1);

    let formattedString = formatDateRange(moment('09-14-2014', FORMAT), moment('09-14-2014', FORMAT), 'day');

    assert.equal(
      formattedString,
      'Sep 14, 2014',
      'Given date range was correctly formatted when start and end dates are the same'
    );
  });
});
