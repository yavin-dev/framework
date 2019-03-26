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
import { scheduleOnce, next } from '@ember/runloop';

import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import layout from '../templates/components/navi-date-picker';
import $ from 'jquery';
import moment from 'moment';
import { getFirstDayEpochIsoDateTimePeriod, getIsoDateTimePeriod } from 'navi-core/utils/date';

/**
 * @constant {String} DATE_FORMAT - date string format used internally
 */
const DATE_FORMAT = 'MM-DD-YYYY';

/**
 * @constant {Object} VIEW_MODE_FROM_PERIOD - Mapping from time period to calendar mode
 */
const VIEW_MODE_FROM_PERIOD = {
  all: 0,
  day: 0,
  week: 0,
  month: 1,
  quarter: 1,
  year: 2
};

export default Component.extend({
  layout,

  classNames: ['navi-date-picker'],

  classNameBindings: ['dateTimePeriod'],

  /**
   * @property {Object} date - date should be after `minDate`
   */
  date: undefined,

  /**
   * @property {String} dateTimePeriod - unit of time being selected ('day', 'week', or 'month')
   */
  dateTimePeriod: 'day',

  /**
   * @property {String} minDate - minimum selectable date
   */
  minDate: computed('dateTimePeriod', function() {
    return getFirstDayEpochIsoDateTimePeriod(get(this, 'dateTimePeriod'), DATE_FORMAT);
  }),

  /**
   * @property {Number} minViewMode - minimum calendar view mode (days/months)
   */
  minViewMode: computed('dateTimePeriod', function() {
    // if the period is absent, pass 0 as default value
    let newViewMode = VIEW_MODE_FROM_PERIOD[get(this, 'dateTimePeriod')] || 0;

    this._updateViewMode(newViewMode);

    return newViewMode;
  }),

  /**
   * @property {Object} _datePickerReference - jQuery object containing the datepicker plugin
   * @private
   */
  _datePickerReference: computed(function() {
    // jQuery datepicker plugin is called on the first child div
    return this.$('> div');
  }).volatile(),

  /**
   * Called when the attributes passed into the component have been updated and on initial render
   *
   * @method didReceiveAttrs
   * @override
   */
  didReceiveAttrs() {
    this._super(...arguments);

    let selectedDate = get(this, 'date'),
      previousDate = get(this, 'previousDate');

    if (selectedDate !== previousDate) {
      let date = selectedDate ? selectedDate.toDate() : undefined;

      set(this, 'selectedDateObj', date);
    }

    //Store old date for rerender logic above
    set(this, 'previousDate', selectedDate);
    set(this, '_lastTimeDate', selectedDate);

    // Make sure selection is highlighted
    scheduleOnce('afterRender', this, this._highlightSelection);
  },

  /**
   * TODO
   * As of 'ember-cli-bootstrap-datepicker' release '0.5.3', updating the minViewMode after
   * creating the component is not supported, but the current master branch has
   * partial support. Once the latest release has this built in, we can remove
   * this function.
   *
   * @method _updateViewMode - update current and minimum view mode after component creation
   * @private
   * @param {Number} newViewMode - view mode to set as min view mode and current view mode
   */
  _updateViewMode(newViewMode) {
    scheduleOnce('afterRender', () => {
      // Change `minViewMode` option after initial creation
      get(this, '_datePickerReference')
        .data('datepicker')
        ._process_options({ minViewMode: newViewMode });

      /*
       * Set view mode to the minimum value
       * View mode cannot be set directly, only set bigger or smaller:
       *   ex: datepicker('showMode', +1) will move from 'month' view to 'decade' view
       *
       * To set to the minimum, move view mode as low as possible
       */
      get(this, '_datePickerReference').datepicker('showMode', -10);

      // Ensure the selected date has been highlighted in the new view mode
      this._highlightSelection();
    });
  },

  /**
   * @method _highlightSelection - Makes sure the current time period is properly highlighted
   * @private
   */
  _highlightSelection: function() {
    /*
     * If in week mode, highlight the entire week
     * For day and month, the underlying component handles highlighting for us
     */
    if (get(this, 'dateTimePeriod') === 'week') {
      get(this, '_datePickerReference')
        .find('.active.day')
        .parent('tr')
        .addClass('active');
    }

    if (get(this, 'dateTimePeriod') === 'quarter') {
      //Add active-month class in next tick, since months will be re-rendered
      next(() => {
        let months = this.$('.month'),
          activeIndex = months.index(this.$('.month.active')),
          quarter = Math.ceil((activeIndex + 1) / 3);

        let startIndex = (quarter - 1) * 3;
        $(months[startIndex + 0]).addClass('active-month');
        $(months[startIndex + 1]).addClass('active-month');
        $(months[startIndex + 2]).addClass('active-month');
      });
    }
  },

  /**
   * @method _isNewDateValue - checks if the date is the same as the last time this method was called
   * @private
   * @param {Date} newDate - date to check
   * @returns {boolean} true if date is the same
   */
  _isNewDateValue(newDate) {
    let lastTime = get(this, '_lastTimeDate');

    set(this, '_lastTimeDate', newDate);

    if (!lastTime) {
      return false;
    }

    return moment(lastTime).isSame(newDate);
  },

  actions: {
    /**
     * Action sent whenever user makes a selection
     * Converts the selected Date into a moment and
     * passes the action on
     *
     * @action
     * @param {Date} newDate - selected calendar date
     */
    changeDate(newDate) {
      this._highlightSelection();
      const handleUpdate = get(this, 'onUpdate');

      // Don't do anything if the date is the same as the last time action was called
      if (this._isNewDateValue(newDate)) {
        return;
      }

      // Convert date to start of time period
      let dateTimePeriod = getIsoDateTimePeriod(get(this, 'dateTimePeriod'));
      if (handleUpdate) handleUpdate(moment(newDate).startOf(dateTimePeriod));
    }
  }
});
