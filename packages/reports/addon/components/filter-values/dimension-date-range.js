/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/dimension-date-range
 *       filter=filter
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../../templates/components/filter-values/dimension-date-range';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-values--dimension-date-range-input'],

  /**
   * @property {Object} startDate - moment of beginning of interval
   */
  startDate: computed.oneWay('filter.values.firstObject'),

  /**
   * @property {Object} endDate - moment of end of interval
   */
  endDate: computed.oneWay('filter.values.lastObject'),

  /**
   * @property {String} lowPlaceholder
   */
  lowPlaceholder: 'Since',

  /**
   * @property {String} highPlaceholder
   */
  highPlaceholder: 'Before',

  actions: {
    /**
     * @action setLowValue
     * @param {String} value - first value to be set in filter
     */
    setLowValue(value) {
      this.attrs.onUpdateFilter({
        values: [value, get(this, 'filter.values.lastObject')]
      });
    },

    /**
     * @action setHighValue
     * @param {String} value - last value to be set in filter
     */
    setHighValue(value) {
      this.attrs.onUpdateFilter({
        values: [get(this, 'filter.values.firstObject'), value]
      });
    }
  }
});
