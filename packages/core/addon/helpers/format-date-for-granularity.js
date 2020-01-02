/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import { isValidMoment } from 'navi-core/helpers/is-valid-moment';
import moment from 'moment';

export const DATE_TIME_FORMATS = {
  second: 'MM/DD/YYYY HH:mm:ss',
  minute: 'MM/DD/YYYY HH:mm:00',
  hour: 'MM/DD/YYYY HH:00:00',
  day: 'MM/DD/YYYY',
  all: 'MM/DD/YYYY',
  week: 'MM/DD',
  month: 'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year: 'YYYY'
};

/**
 * @function formatDateForGranularity
 * @param {String} date
 * @param {String} granularity
 * @returns {String} date in a human readable format based on granularity
 */
export function formatDateForGranularity(date, granularity) {
  //Construct date to avoid deprecation warning
  if (!isValidMoment(date)) {
    return '--';
  }

  if (granularity === 'week') {
    return _formatWeek(date);
  }

  return moment(date).format(DATE_TIME_FORMATS[granularity]);
}

/*
 * Formats Date for Week
 * If the week starts and ends in different years, the whole date should be rendered (M/D/YYYY)
 * Otherwise, the format of start date should be M/D and end date should be M/D/YYYY
 * @function _formatWeek
 * @private
 * @param {String} startDate - start day of a week
 * @returns {String} 'startDate - endDate' of a week
 */
function _formatWeek(startDate) {
  let startDateOfWeek = moment(startDate),
    endDateOfWeek = moment(startDate).add(6, 'days'),
    endDateOfWeekFormatted = endDateOfWeek.format(DATE_TIME_FORMATS['day']);

  let endFormat = startDateOfWeek.isSame(endDateOfWeek, 'year') ? 'week' : 'day',
    startDateOfWeekFormatted = startDateOfWeek.format(DATE_TIME_FORMATS[endFormat]);

  return `${startDateOfWeekFormatted} - ${endDateOfWeekFormatted}`;
}

export default buildHelper(args => formatDateForGranularity(...args));
