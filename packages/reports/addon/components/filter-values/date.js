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
   * @property {Moment} selectedDate
   */
  selectedDate: null,

  /**
   * @property {String} displayedDate
   */
  displayedDate: computed('filter.values', function() {
    let filterDate = get(this, 'filter.values.firstObject');

    return filterDate ? Moment(filterDate).format('MMM DD, YYYY') : 'Select date';
  }),

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
    },

    /**
     * @action closeDropdown
     * @param {Object} dropdown - the ember-basic-dropdown object
     */
    closeDropdown(dropdown) {
      dropdown.actions.close();
    }
  }
});
