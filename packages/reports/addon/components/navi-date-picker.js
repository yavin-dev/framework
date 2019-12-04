/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-date-picker
 *      date=initialDate
 *      dateTimePeriod='month'
 *      onUpdate=(action handleUpdate)
 *   }}
 */
import Component from '@ember/component';
import { get, computed, action } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { layout as templateLayout, classNames, className } from '@ember-decorators/component';
import layout from '../templates/components/navi-date-picker';
import moment from 'moment';
import range from 'lodash/range';
import {
  getFirstDayEpochIsoDateTimePeriod,
  getFirstDayOfIsoDateTimePeriod,
  getLastDayOfIsoDateTimePeriod,
  getIsoDateTimePeriod
} from 'navi-core/utils/date';

@templateLayout(layout)
@classNames('navi-date-picker')
export default class extends Component {
  /**
   * @property {String} dateTimePeriodClass - The class to append depending on the dateTimePeriod
   */
  @className
  @computed('dateTimePeriod')
  get dateTimePeriodClass() {
    return `navi-date-picker-${this.dateTimePeriod}`;
  }

  /**
   * @property {Object} date - date should be after `minDate`
   */
  date = undefined;

  /**
   * @property {Moment} centerDate - The date to focus the calendar around, initially the provided date
   */
  @oneWay('date')
  centerDate;

  /**
   * @property {String} dateTimePeriod - unit of time being selected ('day', 'week', or 'month')
   */
  dateTimePeriod = 'day';

  /**
   * @property {String} minDate - minimum selectable date
   */
  @computed('dateTimePeriod')
  get minDate() {
    return new Date(getFirstDayEpochIsoDateTimePeriod(this.dateTimePeriod));
  }

  /**
   * @property {String[]} months - The months available to pick from in the current year
   */
  @computed('centerDate', 'minDate')
  get months() {
    let months = moment.months();
    const minDateTime = moment(this.minDate);
    if (this.centerDate.year() === minDateTime.year()) {
      const minMonth = minDateTime.month - 1;
      months = months.filter((m, i) => i >= minMonth);
    }
    return months;
  }

  /**
   * @property {String[]} years - The years available to pick from
   */
  @computed('minDate')
  get years() {
    const start = moment(this.minDate).year();
    const end = moment().year() + 1;
    return range(start, end).map(y => y.toString());
  }

  /**
   * Switches the calendars center based on the selected month or year from the select
   * @param unit - grain to switch
   * @param calendar - reference to calendar object
   * @param e - the input event
   */
  changeCenter(unit, calendar, e) {
    let newCenter = moment(calendar.center)
      .clone()
      [unit](e.target.value);
    calendar.actions.changeCenter(newCenter);
  }

  /**
   * Applies a selected class to each day if it lies within the week being selected. This visually represents an
   * entire week being selected on the calendar even though it is only the first day that is actually selected.
   *
   * @param {Object} day - The day to apply a custom style for
   * @param {Object} calendar - The calendar object being rendered on
   * @param {Array} weeks - The weeks being shown for the calendar
   * @returns {string}
   */
  selectedWeekClass(day, calendar, weeks) {
    const selected = weeks.flatMap(w => w.days).find(d => d.isSelected);
    const classes = ['ember-power-calendar-week-day'];
    if (selected) {
      let selectedWeekStart = moment(getFirstDayOfIsoDateTimePeriod(selected.moment, 'week'));
      let selectedWeekEnd = moment(getLastDayOfIsoDateTimePeriod(selectedWeekStart, 'week'));
      if (day.moment.isBetween(selectedWeekStart, selectedWeekEnd, undefined, '[]')) {
        classes.push('ember-power-calendar-day--selected');
      }
    }

    return classes.join(' ');
  }

  /**
   * Action sent whenever user makes a selection
   * Converts the selected Date into a moment and
   * passes the action on
   *
   * @action
   * @param {Date} newDate - selected calendar date
   */
  @action
  changeDate(newDate) {
    const handleUpdate = get(this, 'onUpdate');

    // Convert date to start of time period
    let dateTimePeriod = getIsoDateTimePeriod(get(this, 'dateTimePeriod'));
    if (handleUpdate) handleUpdate(moment(newDate).startOf(dateTimePeriod));
  }
}
