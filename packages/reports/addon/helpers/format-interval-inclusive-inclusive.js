/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';

import { assert } from '@ember/debug';
import { capitalize } from '@ember/string';
import Duration from 'navi-core/utils/classes/duration';
import DateUtils from 'navi-core/utils/date';

/**
 * Converts an [inclusive - exclusive] to an [inclusive - inclusive] date range
 * and formats the range in the form "May 3, 2014 - May 4, 2014"
 *
 * @method formatInterval
 * @param {Interval} interval - object to format
 * @param {String} timePeriod - time period dates should align to
 * @returns {String} formatted string representation of interval
 */
export function formatInterval([interval, timePeriod]) {
  if (!interval || !timePeriod) {
    return '';
  }

  // to Date detection
  if (interval._end === 'next' && interval._start === 'current') {
    return `Current ${capitalize(timePeriod)}`;
  }

  // Format 'duration/current' intervals based on duration
  if (Duration.isDuration(interval._start) && interval._end === 'current') {
    return formatDurationFromCurrent(interval._start, timePeriod);

    // Format other cases based on date range
  } else {
    /*
     * Convert from [inclusive - exclusive] range to a [inclusive - inclusive]
     * range for user display
     */
    let range = interval.asMomentsForTimePeriod(timePeriod);
    range.end.subtract(1, timePeriod);

    return formatDateRange(range.start, range.end, timePeriod);
  }
}

/**
 * Converts a duration into string representing how long ago duration is from today
 *
 * @method formatDurationFromCurrent
 * @param {Duration} duration - object to format
 * @param {String} timePeriod - time period dates should align to
 * @returns {String} formatted string
 */
export function formatDurationFromCurrent(duration, timePeriod) {
  if (!duration) {
    return '';
  }

  // All case
  if (Duration.isAll(duration)) {
    return 'All';
  }

  let durationValue = duration.getValue(),
    durationUnit = duration.getUnit();

  if (timePeriod === 'quarter') {
    assert('Formatting a quarter with a duration must be in terms on months', durationUnit === 'month');
    durationValue = durationValue / 3;
    durationUnit = 'quarter';
  }

  // Singular
  if (durationValue === 1) {
    return `Last ${capitalize(durationUnit)}`;
  }

  // Standard case
  return `Last ${durationValue} ${capitalize(durationUnit)}s`;
}

/**
 * Formats the date range based on the time Period
 *
 * @method formatDateRange
 * @param {Object} start - moment object with start properties
 * @param {Object} end - moment object with end properties
 * @param {String} timePeriod - the time period to be formatted
 * @returns {String} formatted string
 */
export function formatDateRange(start, end, timePeriod) {
  assert('Start & End dates and time period  must be defined', start && end && timePeriod);

  let formats = {
    month: 'MMM YYYY',
    quarter: '[Q]Q YYYY',
    year: 'YYYY'
  };

  let format = formats[timePeriod] || 'MMM DD, YYYY',
    startString = start.format(format),
    endString = end.endOf(DateUtils.getIsoDateTimePeriod(timePeriod)).format(format);

  if (startString === endString) {
    return startString;
  }

  return `${startString} - ${endString}`;
}

export default buildHelper(formatInterval);
