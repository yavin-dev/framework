/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Component from '@ember/component';
import { computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import Interval from 'navi-core/utils/classes/interval';
import { formatDateRange } from 'navi-reports/helpers/format-interval-inclusive-inclusive';
import { getIsoDateTimePeriod } from 'navi-core/utils/date';
import moment from 'moment';

export default class BaseIntervalComponent extends Component {
  startPlaceholder = 'Start';

  endPlaceholder = 'End';

  /**
   * @property {String} dateTimePeriod - the current time grain
   */
  @readOnly('request.logicalTable.timeGrain.name') dateTimePeriod;

  /**
   * @property {Interval} interval - The interval of the selected date range
   */
  @readOnly('filter.values.firstObject') interval;

  /**
   * @property {Moment} startDate - start of interval
   */
  @computed('interval', 'dateTimePeriod')
  get startDate() {
    const { interval, dateTimePeriod } = this;
    if (Interval.isInterval(interval)) {
      return interval.asMomentsForTimePeriod(dateTimePeriod).start;
    }
    return undefined;
  }

  /**
   * @property {String} startFormat - start of interval
   */
  @computed('startDate', 'calendarTriggerFormat')
  get startFormat() {
    return this.startDate.format(this.calendarTriggerFormat);
  }

  /**
   * @property {Moment} endDate - end of interval
   */
  @computed('interval', 'dateTimePeriod')
  get endDate() {
    const { interval, dateTimePeriod } = this;
    if (Interval.isInterval(interval)) {
      let end = interval.asMomentsForTimePeriod(dateTimePeriod).end;
      end = end.clone().subtract(1, dateTimePeriod);
      return end;
    }
    return undefined;
  }

  /**
   * @property {String} startFormat - start of interval
   */
  @computed('endDate', 'dateTimePeriod', 'calendarTriggerFormat')
  get endFormat() {
    const { dateTimePeriod, endDate } = this;
    const end = dateTimePeriod === 'week' ? endDate.clone().endOf('isoweek') : endDate;
    return end.format(this.calendarTriggerFormat);
  }

  /**
   * @property {String} calendarTriggerFormat - the datetime format to display based on the time grain
   */
  @computed('dateTimePeriod')
  get calendarTriggerFormat() {
    const dateMap = {
      day: 'MMM DD, YYYY',
      month: 'MMM YYYY',
      quarter: '[Q]Q YYYY',
      year: 'YYYY'
    };
    return dateMap[this.dateTimePeriod] || dateMap.day;
  }

  /**
   * @property {String} dateRange - The representation of the selected inclusive interval
   */
  @computed('interval', 'dateTimePeriod')
  get dateRange() {
    const { start, end } = this.interval.asMomentsForTimePeriod(this.dateTimePeriod);
    end.subtract(1, getIsoDateTimePeriod(this.dateTimePeriod));
    return formatDateRange(start, end, this.dateTimePeriod);
  }

  /**
   * @action setInterval
   * @param {Moment} start - start date for interval
   * @param {Moment|string} end - end date for interval
   * @param {boolean} makeEndInclusive - optionally add an extra dateTimePeriod to include the selected end
   */
  @action
  setInterval(start, end, makeEndInclusive = true) {
    let intervalEnd;
    if (moment.isMoment(end) && makeEndInclusive === true) {
      intervalEnd = end.clone().add(1, this.dateTimePeriod);
    } else {
      intervalEnd = end;
    }

    const interval = new Interval(start, intervalEnd);
    this.onUpdateFilter({ interval });

    return interval;
  }

  /**
   * @action setIntervalStart
   * @param {Moment} value - start date for interval
   * @param {boolean} makeEndInclusive - optionally add an extra dateTimePeriod to include the selected end
   */
  @action
  setIntervalStart(value, makeEndInclusive = false) {
    return this.setInterval(value, this.interval._end, makeEndInclusive);
  }

  /**
   * @action setIntervalEnd
   * @param {Moment} value - end date for interval
   */
  @action
  setIntervalEnd(value) {
    return this.setInterval(this.interval._start, value);
  }
}
