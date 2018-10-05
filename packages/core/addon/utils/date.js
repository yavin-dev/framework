/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import moment from 'moment';
import config from 'ember-get-config';

export const EPOCH_FORMAT_STRING = 'YYYY-MM-DD';
export const MONTH_DATE_FORMAT_STRING = 'M/D';
export const API_DATE_FORMAT_STRING = 'YYYY-MM-DD HH:mm:ss.SSS';
export const PARAM_DATE_FORMAT_STRING = 'YYYY-MM-DD';
export const CAL_DATE_FORMAT_STRING = 'MM-DD-YYYY';
export const CAL_DISPLAY_DATE_FORMAT_STRING = 'M/D/YYYY';

/**
 * Computes an array of each date, bucketed by time grain,
 * between a given interval's start and end (exclusive)
 *
 * Ex: Each week between Jan 1 and May 1
 *
 * @function getDatesForInterval
 * @param {Interval} interval
 * @param {String} grain - string representation of the length of time for each date bucket, ex: 'week'
 * @returns {Array} moment representation of each date between interval's start and end
 */
export function getDatesForInterval(interval, grain) {
  let range = interval.asMomentsForTimePeriod(grain),
    currentDate = range.start,
    dates = [];

  if (grain === 'all') {
    return [currentDate.clone()];
  }

  while (currentDate.isBefore(range.end)) {
    dates.push(currentDate.clone());
    currentDate.add(1, grain);
  }

  return dates;
}

/**
 * Converts the epoch date obtained from the getEpochDate function by rounding the beginning to the start of the next DateTimePeriod
 * if the feature flag is on,else rounds the epoch date configured by the dataEpoch configuration to the start of next DateTimePeriod and returns it.
 *
 * @method getFirstDayEpochIsoDateTimePeriod
 * @param {String} dateTimePeriod
 * @param {String} dateFormat
 * @return {Object} moment date object
 */
export function getFirstDayEpochIsoDateTimePeriod(dateTimePeriod, dateFormat) {
  let isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod),
    format = dateFormat || API_DATE_FORMAT_STRING,
    epochDate = moment(config.navi.dataEpoch, EPOCH_FORMAT_STRING);

  return epochDate
    .add(1, dateTimePeriod)
    .subtract(1, 'day')
    .startOf(isoDateTimePeriod)
    .format(format);
}

/**
 * Returns the first day of the previous dateTimePeriod in the specified format
 *
 * @method getLastDayOfPrevIsoDateTimePeriod
 * @param {String} dateTimePeriod
 * @param {String} dateFormat
 * @return {Object} moment date Object
 */
export function getFirstDayOfPrevIsoDateTimePeriod(dateTimePeriod, dateFormat) {
  let format = dateFormat || API_DATE_FORMAT_STRING,
    isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
  return moment()
    .subtract(1, dateTimePeriod)
    .startOf(isoDateTimePeriod)
    .format(format);
}

/**
 * Returns the Last day of the previous dateTimePeriod in the specified format
 *
 * @method getLastDayOfPrevIsoDateTimePeriod
 * @param {String} dateTimePeriod
 * @param {String} dateFormat
 * @return {Object} moment date Object
 */
export function getLastDayOfPrevIsoDateTimePeriod(dateTimePeriod, dateFormat) {
  let format = dateFormat || API_DATE_FORMAT_STRING;
  let isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
  return moment()
    .startOf(isoDateTimePeriod)
    .subtract(1, 'day')
    .format(format);
}

/**
 * Given a date, dateTimePeriod and format this function returns the Last day of the passed-in dateTimePeriod in the specified format
 *
 * @method getLastDayOfIsoDateTimePeriod
 * @param {Object} date
 * @param {String} dateTimePeriod
 * @param {String} dateFormat
 * @return {Object} moment date Object
 */
export function getLastDayOfIsoDateTimePeriod(date, dateTimePeriod, dateFormat) {
  if (date && dateTimePeriod) {
    let format = dateFormat || API_DATE_FORMAT_STRING;
    let isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
    return moment(date)
      .endOf(isoDateTimePeriod)
      .format(format);
  } else {
    throw new Error('getLastDayOfIsoDateTimePeriod : Required Date/DateTimePeriod is missing');
  }
}

/**
 * Given a date, dateTimePeriod and format this function returns the first day of the passed-in ISO dateTimePeriod in the specified format
 *
 * @method getFirstDayOfIsoDateTimePeriod
 * @param {Object} date
 * @param {String} dateTimePeriod
 * @param {String} dateFormat
 * @return {Object} moment date Object
 */
export function getFirstDayOfIsoDateTimePeriod(date, dateTimePeriod, dateFormat) {
  if (date && dateTimePeriod) {
    let format = dateFormat || API_DATE_FORMAT_STRING;
    let isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
    return moment(date)
      .startOf(isoDateTimePeriod)
      .format(format);
  } else {
    throw new Error('getFirstDayOfIsoDateTimePeriod : Required Date/DateTimePeriod is missing');
  }
}

/**
 * Given a dateTimePeriod this functions returns its equivalent ISO dateTimePeriod
 *
 * @method getIsoDateTimePeriod
 * @param {String} dateTimePeriod
 * @return {String} ISO equivalent dateTimePeriod
 */
export function getIsoDateTimePeriod(dateTimePeriod) {
  if (dateTimePeriod) {
    let timePeriod = dateTimePeriod;
    if (dateTimePeriod.toLowerCase() === 'week') {
      timePeriod = 'isoweek';
    }
    return timePeriod;
  } else {
    throw new Error('getIsoDateTimePeriod : Required DateTimePeriod is missing');
  }
}
