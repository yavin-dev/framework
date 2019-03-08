/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description:
 *   Provides `setStart` and `setEnd` actions for picking ranges
 *
 * Usage:
 *   {{#pick-range-container
 *      selection=range
 *      dateTimePeriod='week'
 *      onUpdateSelection=(action 'updateSelection')
 *      as |selection container datesAsMoments datesAsStrings|
 *   }}
 *      {{#pick-form}}
 *          <div {{action 'setStart' newStart target=container}}>Set Start</div>
 *          <div {{action 'setEnd' newEnd target=container}}>Set End</div>
 *      {{/pick-form}}
 *   {{/pick-range-container}}
 */

import { set, get, computed } from '@ember/object';

import PickObjectContainer from 'navi-core/components/pick-object-container';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';
import layout from '../templates/components/pick-range-container';
import DateUtils from 'navi-core/utils/date';

export default PickObjectContainer.extend({
  layout,

  /**
   * @method init
   * @override
   */
  init() {
    this._super();
    //set prevEndDate on init
    set(this, 'prevEndDate', get(this, 'selection._end'));
  },

  /**
   * @property {Object} dateMoments - start and end dates/durations as moments
   */
  dateMoments: computed('_editableSelection._start', '_editableSelection._end', function() {
    let { _start, _end } = this.getStagedSelection();
    return this._momentsForCustomRange(new Interval(_start, _end));
  }),

  /**
   * @property {Object} dateStrings - start and end dates/durations as strings
   */
  dateStrings: computed('_editableSelection._start', '_editableSelection._end', function() {
    let { _start, _end } = this.getStagedSelection();
    return new Interval(_start, _end).asStrings(DateUtils.PARAM_DATE_FORMAT_STRING);
  }),

  /**
   * @method _momentsForCustomRange
   * @private
   * @param {Interval} interval - object to convert to moments
   * @returns {Object} object with start/end properties containing moments
   */
  _momentsForCustomRange(interval) {
    let dateTimePeriod = get(this, 'dateTimePeriod'),
      moments = interval.asMomentsForTimePeriod(dateTimePeriod);

    /*
     * Convert from interval's [inclusive - exclusive] range to a [inclusive - inclusive]
     * range for the custom range picker
     */
    moments.end.subtract(1, dateTimePeriod);

    return moments;
  },

  /**
   * Parses date string from the input fields
   *
   * @method parseDate
   * @param {String} date - date string from input
   * @returns {Duration|moment|string} - object most closely represented by the string
   */
  parseDate(date) {
    if (typeof date === 'string') {
      return Interval.fromString(date);
    }
    return date;
  },

  actions: {
    applyChanges() {
      let selection = this.getStagedSelection();

      this._super(new Interval(selection._start, selection._end));
    },

    setStart(start) {
      start = this.parseDate(start); //convert from string

      this.send('stagePropertyChange', '_start', start);
    },

    /**
     * Used to set the end of the advanced range selector
     * @param {String} - date entered into box, could be date or macro.
     */
    setExclusiveEnd(end) {
      end = this.parseDate(end); //convert from string

      set(this, 'prevEndDate', end);

      this.send('stagePropertyChange', '_end', end);
    },

    /**
     * Used to set date when picking from calendar picker.
     * @param {String} - date string chosen from calendar
     */
    setEnd(end) {
      end = this.parseDate(end); //convert from string

      if (moment.isMoment(end)) {
        end = end.clone().add(1, this.get('dateTimePeriod'));
      }

      set(this, 'prevEndDate', end);

      this.send('stagePropertyChange', '_end', end);
    }
  }
});
