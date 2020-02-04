/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviDatePicker
 *      @date={{this.initialDate}}
 *      @dateTimePeriod="month"
 *      @onUpdate={{this.handleUpdate}}
 *   />
 */
import Component from '@ember/component';
import { get, set, computed, action } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
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
@tagName('')
class NaviDatePicker extends Component {
  /**
   * @method init
   * @override
   */
  init() {
    super.init(...arguments);
    this.centerDate = this.centerDate || this.date || getFirstDayOfIsoDateTimePeriod(moment(), this.dateTimePeriod);
  }

  /**
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    const { previousDate, date } = this;

    if (date !== previousDate) {
      let newDate = date || undefined;

      set(this, 'selectedDate', newDate);
      set(this, 'centerDate', newDate);
    }

    //Store old date for rerender logic above
    set(this, 'previousDate', date);
    set(this, '_lastTimeDate', date);
  }

  /**
   * @property {Moment} date - date should be after `minDate`
   */
  date;

  /**
   * @property {Moment} centerDate - The date that determines the current view of the calendar, defaults to selected date initially
   */
  centerDate;

  /**
   * @property {String} dateTimePeriod - unit of time being selected ('day', 'week', or 'month')
   */
  dateTimePeriod = 'day';

  /**
   * @property {Date} minDate - minimum selectable date
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
    const { centerDate, minDate } = this;

    let months = moment.months();
    const minDateTime = moment(minDate);
    if (centerDate.year() === minDateTime.year()) {
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
    calendar.send('changeCenter', newCenter);
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
      const selectedWeekStart = moment(getFirstDayOfIsoDateTimePeriod(selected.moment, 'week'));
      const selectedWeekEnd = moment(getLastDayOfIsoDateTimePeriod(selectedWeekStart, 'week'));
      if (day.moment.isBetween(selectedWeekStart, selectedWeekEnd, undefined, '[]')) {
        classes.push('ember-power-calendar-day--selected');
      }
    }

    return classes.join(' ');
  }

  /**
   * @method _isDateSameAsLast - checks if the date is the same as the last time this method was called
   * @private
   * @param {Date} newDate - date to check
   * @returns {boolean} true if date is the same
   */
  _isDateSameAsLast(newDate) {
    let lastTime = get(this, '_lastTimeDate');

    set(this, '_lastTimeDate', newDate);

    if (!lastTime) {
      return false;
    }

    return moment(lastTime).isSame(newDate);
  }

  /**
   * Sets the center date from a power calendar event
   *
   * @action
   * @param {Object} object - container for selected calendar date
   */
  @action
  setCenterDate({ moment: newDate }) {
    set(this, 'centerDate', newDate);
  }

  /**
   * Action sent whenever user makes a selection
   * Converts the selected Date into a moment and
   * passes the action on
   *
   * @action
   * @param {Object} object - container for selected calendar date
   */
  @action
  changeDate({ moment: newDate }) {
    // Don't do anything if the date is the same as the last time action was called
    if (this._isDateSameAsLast(newDate)) {
      return;
    }

    // Convert date to start of time period
    let dateTimePeriod = getIsoDateTimePeriod(this.dateTimePeriod);
    const selectedDate = moment(newDate).startOf(dateTimePeriod);

    set(this, 'selectedDate', selectedDate);
    const handleUpdate = this.onUpdate;
    if (handleUpdate) {
      handleUpdate(selectedDate);
    }
  }
}

export default NaviDatePicker;
