/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/date-range
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/filter-values/date-range';
import { get, computed, action } from '@ember/object';
import { layout as templateLayout, classNames } from '@ember-decorators/component';
import Interval from 'navi-core/utils/classes/interval';

@templateLayout(layout)
@classNames('filter-values--date-range-input')
class DateRange extends Component {
  lowPlaceholder = 'Start';

  highPlaceholder = 'Before';

  /**
   * @property {String} dateTimePeriod - the current time grain
   */
  @computed('request.logicalTable.timeGrain.name')
  get dateTimePeriod() {
    return get(this, 'request.logicalTable.timeGrain.name');
  }

  /**
   * @property {Interval} interval - The interval of the selected date range
   */
  @computed('filter.values.firstObject')
  get interval() {
    return get(this, 'filter.values.firstObject');
  }

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
    let end = endDate;
    if (dateTimePeriod === 'week') {
      end = endDate.clone().endOf('isoweek');
    }
    return end.format(this.calendarTriggerFormat);
  }

  /**
   * @property {String} calendarTriggerFormat - the datetime format to display based on the time grain
   */
  @computed('dateTimePeriod')
  get calendarTriggerFormat() {
    let dateMap = {
      day: 'MMM DD, YYYY',
      month: 'MMM YYYY',
      quarter: '[Q]Q YYYY',
      year: 'YYYY'
    };
    // TODO: if (dateTimePeriod=week and formatting endDate) { show end of week }
    return dateMap[this.dateTimePeriod] || dateMap.day;
  }

  /**
   * @action setInterval
   * @param {Moment} start - start date for interval
   * @param {Moment} end - end date for interval
   */
  @action
  setInterval(start, end) {
    end = end.clone().add(1, this.dateTimePeriod);
    this.onUpdateFilter({
      interval: new Interval(start, end)
    });
  }

  /**
   * @action setLowValue
   * @param {Moment} value - start date for interval
   */
  @action
  setLowValue(value) {
    this.setInterval(value, this.endDate);
  }

  /**
   * @action setHighValue
   * @param {Moment} value - end date for interval
   */
  @action
  setHighValue(value) {
    this.setInterval(this.startDate, value);
  }
}

export default DateRange;
