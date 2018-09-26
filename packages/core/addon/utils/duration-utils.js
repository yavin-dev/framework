/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import moment from 'moment';
import Duration from './classes/duration';
import DateUtils from './date';

/**
 * Map of durations equivalent to a year for different time units
 */
const YEAR_MAP = {
  day: 'P365D',
  week: 'P52W',
  month: 'P12M',
  year: 'P1Y'
};

/**
 * Validates if argument is a Duration Object, if not throws an error
 *
 * @param {Duration} duration
 */
function validateDurationArgument(duration) {
  Ember.assert('Duration should be a duration object', Duration.isDuration(duration));
}

export default {
  /**
   * Subtracts a given duration from a given date
   *
   * @method subtractDurationFromDate
   * @param {Moment} date - Moment object representing date
   * @param {Duration} duration - duration to subtract from given date
   * @returns {Moment} - resultant date of the subtraction
   */
  subtractDurationFromDate: function(date, duration) {
    Ember.assert('Date should be a moment object', moment.isMoment(date));
    validateDurationArgument(duration);
    // Moment subtract mutates original date object hence the clone
    return date.clone().subtract(duration.getValue(), duration.getUnit());
  },

  /**
   * Computes the start of interval given the end date and duration of the interval
   *
   * @method computeStartOfInterval
   * @param {Moment} endDate - end date of the interval
   * @param {Duration} duration - duration object
   * @param {String} dateTimePeriod - string representing dateTimePeriod
   * @returns {Moment} - start date of interval
   */
  computeStartOfInterval: function(endDate, duration, dateTimePeriod) {
    validateDurationArgument(duration);
    Ember.assert('Date should be a moment object', moment.isMoment(endDate));

    let epochDate = moment(DateUtils.getFirstDayEpochIsoDateTimePeriod(dateTimePeriod));
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
   * @param {Duration} duration
   * @param {String} dateTimePeriod
   * @returns {boolean} - true if duration is over a year else false
   */
  isDurationOverAYear: function(duration, dateTimePeriod) {
    validateDurationArgument(duration);
    Ember.assert('Date time period must be defined', dateTimePeriod);

    let comparisonPeriod = YEAR_MAP[dateTimePeriod] || 'P1Y';

    return duration.compare(comparisonPeriod) === 1;
  }
};
