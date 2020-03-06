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
  /**
   * @property {String} startPlaceholder - The text displayed when there is no startDate
   */
  startPlaceholder = 'Start';

  /**
   * @property {String} endPlaceholder - The text displayed when there is no endDate
   */
  endPlaceholder = 'End';

  /**
   * @property {String} dateTimePeriod - the current time grain
   */
  @readOnly('request.logicalTable.timeGrain.name') dateTimePeriod;

  /**
   * @property {String} lowestDateTimePeriod - the lowest supported time grain of the table
   */
  @readOnly('request.logicalTable.table.timeGrains.firstObject.name') lowestDateTimePeriod;

  /**
   * @property {String} calendarDateTimePeriod - the active dateTimePeriod which does not include 'all'
   */
  @computed('dateTimePeriod', 'lowestDateTimePeriod')
  get calendarDateTimePeriod() {
    const { dateTimePeriod, lowestDateTimePeriod } = this;
    return dateTimePeriod !== 'all' ? dateTimePeriod : lowestDateTimePeriod;
  }

  /**
   * @property {Interval} interval - The interval of the selected date range
   */
  @readOnly('filter.values.firstObject') interval;

  /**
   * @property {Moment|undefined} startDate - start of interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get startDate() {
    const { interval, calendarDateTimePeriod } = this;
    if (Interval.isInterval(interval)) {
      return interval.asMomentsForTimePeriod(calendarDateTimePeriod).start;
    }
    return undefined;
  }

  /**
   * @property {String|undefined} startFormat - start of interval
   */
  @computed('startDate', 'calendarTriggerFormat')
  get startFormat() {
    const { startDate, calendarTriggerFormat } = this;
    if (!startDate) {
      return undefined;
    }
    return startDate.format(calendarTriggerFormat);
  }

  /**
   * @property {Moment|undefined} endDate - end of interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get endDate() {
    const { interval, calendarDateTimePeriod } = this;
    if (Interval.isInterval(interval)) {
      let end = interval.asMomentsForTimePeriod(calendarDateTimePeriod, false).end;
      end = end.clone().subtract(1, calendarDateTimePeriod);
      return end;
    }
    return undefined;
  }

  /**
   * @property {String|undefined} startFormat - start of interval
   */
  @computed('endDate', 'calendarDateTimePeriod', 'calendarTriggerFormat')
  get endFormat() {
    const { endDate, calendarDateTimePeriod, calendarTriggerFormat } = this;
    if (!endDate) {
      return undefined;
    }

    const end = calendarDateTimePeriod === 'week' ? endDate.clone().endOf('isoweek') : endDate;
    return end.format(calendarTriggerFormat);
  }

  /**
   * @property {String} calendarTriggerFormat - the datetime format to display based on the time grain
   */
  @computed('calendarDateTimePeriod')
  get calendarTriggerFormat() {
    const dateMap = {
      hour: 'MMM DD, YYYY',
      day: 'MMM DD, YYYY',
      month: 'MMM YYYY',
      quarter: '[Q]Q YYYY',
      year: 'YYYY'
    };
    return dateMap[this.calendarDateTimePeriod] || dateMap.day;
  }

  /**
   * @property {String} dateRange - The representation of the selected inclusive interval
   */
  @computed('interval', 'calendarDateTimePeriod')
  get dateRange() {
    const { interval, calendarDateTimePeriod } = this;
    const { start, end } = interval.asMomentsForTimePeriod(calendarDateTimePeriod);
    end.subtract(1, getIsoDateTimePeriod(calendarDateTimePeriod));
    return formatDateRange(start, end, calendarDateTimePeriod);
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
      intervalEnd = end.clone().add(1, this.calendarDateTimePeriod);
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
