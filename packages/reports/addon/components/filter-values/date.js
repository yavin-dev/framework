/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/date
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import Moment from 'moment';
import layout from '../../templates/components/filter-values/date';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['date'],

  /**
   * @property {Moment} selectedDate - local moment set by date picker
   */
  selectedDate: null,

  /**
   * @property {String} savedDate - the date that's saved in the filter
   */
  savedDate: computed.oneWay('filter.values.firstObject'),

  actions: {
    /**
     * @action setDate
     * @param {Date} date - new date to set in filter
     */
    setDate(date) {
      this.attrs.onUpdateFilter({
        values: [Moment(date).format('YYYY-MM-DD')]
      });
    },

    /**
     * @action resetDate - reset selectedDate to the saved value
     */
    resetDate() {
      let filterVal = get(this, 'filter.values.firstObject'),
        savedDate = filterVal ? Moment(filterVal) : filterVal;

      this.set('selectedDate', savedDate);
    }
  }
});
