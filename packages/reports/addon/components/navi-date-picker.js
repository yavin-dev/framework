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
import { get, computed } from '@ember/object';
import { layout as templateLayout, classNames } from '@ember-decorators/component';
import layout from '../templates/components/navi-date-picker';
import moment from 'moment';
import { getFirstDayEpochIsoDateTimePeriod, getIsoDateTimePeriod } from 'navi-core/utils/date';

/**
 * @constant {String} DATE_FORMAT - date string format used internally
 */
const DATE_FORMAT = 'MM-DD-YYYY';

@templateLayout(layout)
@classNames('navi-date-picker')
export default class extends Component {
  /**
   * @property {Object} date - date should be after `minDate`
   */
  date = undefined;

  /**
   * @property {String} dateTimePeriod - unit of time being selected ('day', 'week', or 'month')
   */
  dateTimePeriod = 'day';

  /**
   * @property {String} minDate - minimum selectable date
   */
  @computed('dateTimePeriod')
  get minDate() {
    return getFirstDayEpochIsoDateTimePeriod(get(this, 'dateTimePeriod'), DATE_FORMAT);
  }

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  years = Array(...Array(20)).map((_, i) => `${i + 2000}`);

  changeCenter(unit, calendar, e) {
    let newCenter = moment(calendar.center)
      .clone()
      [unit](e.target.value);
    calendar.actions.changeCenter(newCenter);
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
