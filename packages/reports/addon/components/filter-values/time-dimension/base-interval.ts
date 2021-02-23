/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed } from '@ember/object';
import { Moment } from 'moment';
import Interval from 'navi-data/utils/classes/interval';
//@ts-ignore
import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import BaseTimeDimensionFilter from './base';

export default class BaseIntervalComponent extends BaseTimeDimensionFilter {
  /**
   * The interval of the selected date range
   */
  @computed('args.filter.values.[]', 'grain')
  get interval(): Interval | undefined {
    const { values } = this.args.filter;
    let [start, end] = values || [];
    if (start && end) {
      return Interval.parseInclusive(start, end, this.grain);
    }
    return undefined;
  }

  /**
   * start of interval
   */
  @computed('interval', 'grain')
  get startDate(): Moment | undefined {
    const { interval, grain } = this;
    return interval?.asMomentsInclusive(grain).start;
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
  @computed('interval', 'grain')
  get endDate() {
    const { interval, grain } = this;
    return interval?.asMomentsInclusive(grain).end;
  }

  /**
   * start of interval
   */
  @computed('endDate', 'grain', 'calendarTriggerFormat')
  get endDateText() {
    const { endDate, grain, calendarTriggerFormat } = this;
    if (!endDate) {
      return undefined;
    }

    // TODO support grain === 'week'
    const end = grain === 'isoWeek' ? endDate.clone().endOf('isoWeek') : endDate;
    return end.format(calendarTriggerFormat);
  }

  /**
   * The representation of the selected inclusive interval
   */
  @computed('interval', 'grain')
  get dateRange(): string | undefined {
    const { startDate, endDate, grain } = this;
    if (startDate && endDate) {
      return formatDateRange(startDate, endDate, grain);
    }
    return undefined;
  }
}
