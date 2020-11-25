/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assert } from '@ember/debug';
import moment, { Moment } from 'moment';
import Duration from './classes/duration';
import { DateTimePeriod, getFirstDayEpochForGrain } from './date';

/**
 * Map of durations equivalent to a year for different time units
 */
const YEAR_MAP: Record<string, string | undefined> = {
  day: 'P365D',
  week: 'P52W',
  month: 'P12M',
  year: 'P1Y'
};

/**
 * Validates if argument is a Duration Object, if not throws an error
 *
 * @param duration
 */
function validateDurationArgument(duration: unknown) {
  assert('Duration should be a duration object', Duration.isDuration(duration));
}

export default {
  /**
   * Subtracts a given duration from a given date
   *
   * @param date - Moment object representing date
   * @param duration - duration to subtract from given date
   * @returns resultant date of the subtraction
   */
  subtractDurationFromDate(date: Moment, duration: Duration): Moment {
    assert('Date should be a moment object', moment.isMoment(date));
    validateDurationArgument(duration);
    const value = duration.getValue();
    const unit = duration.getUnit();
    assert('The duration unit must be defined', unit);
    assert('The duration has a number value of units', typeof value === 'number');
    // Moment subtract mutates original date object hence the clone
    return date.clone().subtract(value, unit);
  },

  /**
   * Computes the start of interval given the end date and duration of the interval
   *
   * @param endDate - end date of the interval
   * @param duration - duration object
   * @param dateTimePeriod - string representing dateTimePeriod
   * @returns start date of interval
   */
  computeStartOfInterval(endDate: Moment, duration: Duration, dateTimePeriod: DateTimePeriod): Moment {
    validateDurationArgument(duration);
    assert('Date should be a moment object', moment.isMoment(endDate));

    let epochDate = moment(getFirstDayEpochForGrain(dateTimePeriod));
    if (Duration.isAll(duration)) {
      return epochDate;
    }

    // Add one to match the duration range i.e. 60 Days = 59 days + current day
    let startDate = this.subtractDurationFromDate(endDate, duration).add(1, dateTimePeriod);

    return moment.max(startDate, epochDate);
  },

  /**
   * Checks if given duration is over a year
   *
   * @param duration
   * @param dateTimePeriod
   * @returns true if duration is over a year else false
   */
  isDurationOverAYear(duration: Duration, dateTimePeriod: string): boolean {
    validateDurationArgument(duration);
    assert('Date time period must be defined', dateTimePeriod);

    let comparisonPeriod = YEAR_MAP[dateTimePeriod] || 'P1Y';

    return duration.compare(comparisonPeriod) === 1;
  }
};
