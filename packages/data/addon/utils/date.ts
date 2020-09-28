/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import moment, { Moment } from 'moment';
import config from 'ember-get-config';

export const EPOCH_FORMAT_STRING = 'YYYY-MM-DD';
export const MONTH_DATE_FORMAT_STRING = 'M/D';
export const API_DATE_FORMAT_STRING = 'YYYY-MM-DD HH:mm:ss.SSS';
export const PARAM_DATE_FORMAT_STRING = 'YYYY-MM-DD';
export const CAL_DATE_FORMAT_STRING = 'MM-DD-YYYY';
export const CAL_DISPLAY_DATE_FORMAT_STRING = 'M/D/YYYY';

type BaseDateTimePeriod = 'hour' | 'minute' | 'day' | 'month' | 'quarter' | 'year';
export type DateTimePeriod = BaseDateTimePeriod | 'week';
export type Grain = DateTimePeriod | 'all';
type IsoDateTimePeriod = BaseDateTimePeriod | 'isoWeek';

/**
 * Given a dateTimePeriod this functions returns its equivalent ISO dateTimePeriod
 *
 * @method getIsoDateTimePeriod
 * @param dateTimePeriod
 * @return ISO equivalent dateTimePeriod
 */
export function getIsoDateTimePeriod(dateTimePeriod: DateTimePeriod): IsoDateTimePeriod {
  if (dateTimePeriod) {
    if (dateTimePeriod === 'week') {
      return 'isoWeek';
    }
    return dateTimePeriod;
  } else {
    throw new Error('getIsoDateTimePeriod : Required DateTimePeriod is missing');
  }
}

/**
 * Converts the epoch date obtained from the getEpochDate function by rounding the beginning to the start of the next DateTimePeriod
 * if the feature flag is on,else rounds the epoch date configured by the dataEpoch configuration to the start of next DateTimePeriod and returns it.
 *
 * @method getFirstDayEpochIsoDateTimePeriod
 * @param dateTimePeriod
 * @param dateFormat
 * @return date
 */
export function getFirstDayEpochIsoDateTimePeriod(
  dateTimePeriod: DateTimePeriod,
  dateFormat: string = API_DATE_FORMAT_STRING
): string {
  const isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
  const epochDate = moment(config.navi.dataEpoch, EPOCH_FORMAT_STRING);

  return epochDate
    .add(1, dateTimePeriod)
    .subtract(1, 'day')
    .startOf(isoDateTimePeriod)
    .format(dateFormat);
}

/**
 * Returns the first day of the previous dateTimePeriod in the specified format
 *
 * @method getLastDayOfPrevIsoDateTimePeriod
 * @param dateTimePeriod
 * @param dateFormat
 * @return date
 */
export function getFirstDayOfPrevIsoDateTimePeriod(
  dateTimePeriod: DateTimePeriod,
  dateFormat: string = API_DATE_FORMAT_STRING
): string {
  const isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
  return moment()
    .subtract(1, dateTimePeriod)
    .startOf(isoDateTimePeriod)
    .format(dateFormat);
}

/**
 * Returns the Last day of the previous dateTimePeriod in the specified format
 *
 * @param dateTimePeriod
 * @param dateFormat
 * @return date
 */
export function getLastDayOfPrevIsoDateTimePeriod(
  dateTimePeriod: DateTimePeriod,
  dateFormat: string = API_DATE_FORMAT_STRING
): string {
  const isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
  return moment()
    .startOf(isoDateTimePeriod)
    .subtract(1, 'day')
    .format(dateFormat);
}

/**
 * Given a date, dateTimePeriod and format this function returns the Last day of the passed-in dateTimePeriod in the specified format
 *
 * @method getLastDayOfIsoDateTimePeriod
 * @param date
 * @param dateTimePeriod
 * @param dateFormat
 * @return string
 */
export function getLastDayOfIsoDateTimePeriod(
  date: Moment,
  dateTimePeriod: DateTimePeriod,
  dateFormat: string = API_DATE_FORMAT_STRING
): string {
  if (date && dateTimePeriod) {
    const isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
    return moment(date)
      .endOf(isoDateTimePeriod)
      .format(dateFormat);
  } else {
    throw new Error('getLastDayOfIsoDateTimePeriod : Required Date/DateTimePeriod is missing');
  }
}

/**
 * Given a date, dateTimePeriod and format this function returns the first day of the passed-in ISO dateTimePeriod in the specified format
 *
 * @method getFirstDayOfIsoDateTimePeriod
 * @param date
 * @param dateTimePeriod
 * @param dateFormat
 * @return date
 */
export function getFirstDayOfIsoDateTimePeriod(
  date: Moment,
  dateTimePeriod: DateTimePeriod,
  dateFormat: string = API_DATE_FORMAT_STRING
): string {
  if (date && dateTimePeriod) {
    const isoDateTimePeriod = getIsoDateTimePeriod(dateTimePeriod);
    return moment(date)
      .startOf(isoDateTimePeriod)
      .format(dateFormat);
  } else {
    throw new Error('getFirstDayOfIsoDateTimePeriod : Required Date/DateTimePeriod is missing');
  }
}
