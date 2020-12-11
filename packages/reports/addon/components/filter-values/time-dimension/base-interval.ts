/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import { Moment } from 'moment';
import { getPeriodForGrain } from 'navi-data/utils/date';
import Interval from 'navi-data/utils/classes/interval';
//@ts-ignore
import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import BaseTimeDimensionFilter from './base';

export default class BaseIntervalComponent extends BaseTimeDimensionFilter {
  /**
   * The interval of the selected date range
   */
  @computed('args.filter.values.[]')
  get interval(): Interval | undefined {
    const { values } = this.args.filter;
    const [start, end] = values || [];
    if (start && end) {
      return Interval.parseFromStrings(start, end);
    }
    return undefined;
  }

  /**
   * start of interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get startDate(): Moment | undefined {
    const { interval, calendarDateTimePeriod } = this;
    return interval?.asMomentsForTimePeriod(calendarDateTimePeriod).start.utc(true);
  }

  /**
   * start of interval
   */
  @computed('startDate', 'calendarTriggerFormat')
  get startDateText() {
    const { startDate, calendarTriggerFormat } = this;
    return startDate?.format(calendarTriggerFormat);
  }

  /**
   * end of interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get endDate() {
    const { interval, calendarDateTimePeriod } = this;
    if (interval) {
      let { end } = interval.asMomentsForTimePeriod(calendarDateTimePeriod, false);
      end = end
        .clone()
        .subtract(1, getPeriodForGrain(calendarDateTimePeriod))
        .utc(true);
      return end;
    }
    return undefined;
  }

  /**
   * start of interval
   */
  @computed('endDate', 'calendarDateTimePeriod', 'calendarTriggerFormat')
  get endDateText() {
    const { endDate, calendarDateTimePeriod, calendarTriggerFormat } = this;
    if (!endDate) {
      return undefined;
    }

    // TODO support calendarDateTimePeriod === 'week'
    const end = calendarDateTimePeriod === 'isoWeek' ? endDate.clone().endOf('isoWeek') : endDate;
    return end.format(calendarTriggerFormat);
  }

  /**
   * The representation of the selected inclusive interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get dateRange(): string | undefined {
    const { startDate, endDate, calendarDateTimePeriod } = this;
    if (startDate && endDate) {
      return formatDateRange(startDate, endDate, calendarDateTimePeriod);
    }
    return undefined;
  }
}
