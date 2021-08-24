/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <NaviDatePicker
 *      @date={{this.initialDate}}
 *      @centerDate={{this.centerDate}}
 *      @dateTimePeriod="month"
 *      @onUpdate={{this.handleUpdate}}
 *   />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import moment from 'moment';
import { range } from 'lodash-es';
import {
  getFirstDayEpochForGrain,
  getFirstDayOfGrain,
  getLastDayOfGrain,
  getPeriodForGrain,
} from 'navi-data/utils/date';

const isValidCalendarDateMessage = 'The date is UTC and aligned to the start of the day grain';
function isValidCalendarDate(date, dateTimePeriod) {
  if (!moment.isMoment(date) || !date.isUTC()) {
    return false;
  }

  assert('A dateTimePeriod is provided', dateTimePeriod);
  const period = getPeriodForGrain(dateTimePeriod);
  if (['second', 'minute', 'hour'].includes(period)) {
    return true;
  }
  return date.clone().startOf('day').isSame(date);
}

class NaviDatePicker extends Component {
  constructor() {
    super(...arguments);
    this.date = this.args.date;
    this.dateTimePeriod = this.args.dateTimePeriod;
    const localDateAsUTCDay = moment().utc(true).startOf('day');
    const center = this.args.centerDate || this.date || localDateAsUTCDay;
    assert(isValidCalendarDateMessage, isValidCalendarDate(center, this.dateTimePeriod));

    // convert utc date to local for ember-power-calendar
    this.centerDate = center.clone().local(true);
    this.selectedDate = center.clone().local(true);
    this.previousDate = center.clone().local(true);
  }

  /**
   * @method updatedAttrs
   * @override
   */
  @action
  updatedAttrs(element, [updatedDate, updatedDateTimePeriod]) {
    let newDate;
    if (updatedDate && updatedDate !== this.previousDate) {
      assert(isValidCalendarDateMessage, isValidCalendarDate(updatedDate, this.dateTimePeriod));
      // convert utc date to local for ember-power-calendar
      newDate = updatedDate.clone().local(true);
    }

    if (updatedDate && !updatedDate.isSame(this.previousDate)) {
      this.selectedDate = newDate;
      this.centerDate = newDate;
    }

    if (this.dateTimePeriod !== updatedDateTimePeriod) {
      this.dateTimePeriod = updatedDateTimePeriod;
    }

    //Store old date for re-render logic above
    this.previousDate = newDate;
    this._lastTimeDate = newDate;
  }

  /**
   * @property {Moment} selectedDate - the date currently selected
   */
  @tracked selectedDate;

  /**
   * @property {Moment} date - date should be after `minDate`
   */
  @tracked date;

  /**
   * @property {Moment} centerDate - The date that determines the current view of the calendar, defaults to selected date initially
   */
  @tracked centerDate;

  /**
   * @property {String} dateTimePeriod - unit of time being selected ('day', 'week', or 'month')
   */
  @tracked dateTimePeriod = 'day';

  /**
   * @property {Date} minDate - minimum selectable date
   */
  get minDate() {
    return new Date(getFirstDayEpochForGrain(this.dateTimePeriod));
  }

  /**
   * @property {String[]} months - The months available to pick from in the current year
   */
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
  get years() {
    const start = moment(this.minDate).year();
    const end = moment().year() + 1;
    return range(start, end).map((y) => y.toString());
  }

  /**
   * Switches the calendars center based on the selected month or year from the select
   * @param unit - grain to switch
   * @param calendar - reference to calendar object
   * @param e - the input event
   */
  changeCenter(unit, calendar, e) {
    let newCenter = moment(calendar.center).clone()[unit](e.target.value);
    return calendar.actions.changeCenter(newCenter);
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
  selectedIsoWeekClass(day, calendar, weeks) {
    const selected = weeks.flatMap((w) => w.days).find((d) => d.isSelected);
    const classes = ['ember-power-calendar-week-day'];
    if (selected) {
      const selectedWeekStart = moment(getFirstDayOfGrain(selected.moment, 'isoWeek'));
      const selectedWeekEnd = moment(getLastDayOfGrain(selectedWeekStart, 'isoWeek'));
      if (day.moment.isBetween(selectedWeekStart, selectedWeekEnd, undefined, '[]')) {
        classes.push('ember-power-calendar-day--selected');
      }
    }

    return classes.join(' ');
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
    const selected = weeks.flatMap((w) => w.days).find((d) => d.isSelected);
    const classes = ['ember-power-calendar-week-day'];
    if (selected) {
      const selectedWeekStart = moment(getFirstDayOfGrain(selected.moment, 'week'));
      const selectedWeekEnd = moment(getLastDayOfGrain(selectedWeekStart, 'week'));
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
    const { _lastTimeDate: lastTime } = this;

    this._lastTimeDate = newDate;

    if (!lastTime) {
      return false;
    }

    return lastTime.isSame(newDate);
  }

  /**
   * Sets the center date from a power calendar event
   *
   * @action
   * @param {Object} object - container for selected calendar date
   */
  @action
  setCenterDate({ moment: newDate }) {
    this.centerDate = newDate;
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

    // Use date in local time for selected date
    this.selectedDate = newDate;
    const handleUpdate = this.args.onUpdate;
    if (handleUpdate && newDate) {
      // convert to utc before passing to action
      handleUpdate(newDate.clone().utc(true));
    }
  }
}

export default NaviDatePicker;
