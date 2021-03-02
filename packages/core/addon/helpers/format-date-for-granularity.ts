/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import { isValidMoment } from 'navi-core/helpers/is-valid-moment';
import moment from 'moment';
import { DateTimePeriod, getPeriodForGrain, Grain } from 'navi-data/utils/date';

export const DATE_TIME_FORMATS: Record<DateTimePeriod, string> = {
  second: 'MM/DD/YYYY HH:mm:ss',
  minute: 'MM/DD/YYYY HH:mm:00',
  hour: 'MM/DD/YYYY HH:00:00',
  day: 'MM/DD/YYYY',
  week: 'MM/DD',
  month: 'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year: 'YYYY',
};

/*
 * Formats Date for Week
 * If the week starts and ends in different years, the whole date should be rendered (M/D/YYYY)
 * Otherwise, the format of start date should be M/D and end date should be M/D/YYYY
 */
function formatWeek(startDate: string): string {
  const startDateOfWeek = moment(startDate);
  const endDateOfWeek = moment(startDate).add(6, 'days');
  const endDateOfWeekFormatted = endDateOfWeek.format(DATE_TIME_FORMATS['day']);

  const endFormat = startDateOfWeek.isSame(endDateOfWeek, 'year') ? 'week' : 'day';
  const startDateOfWeekFormatted = startDateOfWeek.format(DATE_TIME_FORMATS[endFormat]);

  return `${startDateOfWeekFormatted} - ${endDateOfWeekFormatted}`;
}

/**
 * Returns a date in a human readable format based on granularity
 */
export function formatDateForGranularity(date: string, grain: Grain) {
  if (!isValidMoment(date)) {
    return '--';
  }

  const period = getPeriodForGrain(grain);
  return 'week' === period ? formatWeek(date) : moment(date).format(DATE_TIME_FORMATS[period]);
}

export default buildHelper((args: Parameters<typeof formatDateForGranularity>) => formatDateForGranularity(...args));
