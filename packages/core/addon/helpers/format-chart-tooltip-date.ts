/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import moment, { MomentInput } from 'moment';

const TOOLTIP_DATE_TIME_FORMAT: Record<string, string | undefined> = {
  second: 'MMM D HH:mm:ss',
  minute: 'MMM D HH:mm:00',
  hour: 'MMM D HH:00',
  day: 'MMMM D, YYYY',
  week: 'MMMM D, YYYY',
  month: 'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year: 'YYYY'
};

/**
 * Formats the date based on request timeGrain
 * @param request - request used to get data
 * @param value
 * @return Formatted date string for the provided date string
 */
export function formatChartTooltipDate(request: RequestFragment, value: MomentInput): string | undefined {
  if (request && value) {
    const timeGrain = request.timeGrain || '';
    return moment(value).format(TOOLTIP_DATE_TIME_FORMAT[timeGrain]);
  }
  return undefined;
}

export default buildHelper((args: Parameters<typeof formatChartTooltipDate>) => formatChartTooltipDate(...args));
