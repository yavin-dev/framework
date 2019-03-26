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

import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import { get } from '@ember/object';
import layout from '../../templates/components/filter-values/dimension-date-range';
import Moment from 'moment';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-values--dimension-date-range-input'],

  /**
   * @property {String} startDate - date (YYYY-MM-DD) of beginning of interval
   */
  startDate: oneWay('filter.values.firstObject'),

  /**
   * @property {String} endDate - date (YYYY-MM-DD) of end of interval
   */
  endDate: oneWay('filter.values.lastObject'),

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
      this.onUpdateFilter({
        values: [Moment(value).format('YYYY-MM-DD'), get(this, 'filter.values.lastObject')]
      });
    },

    /**
     * @action setHighValue
     * @param {String} value - last value to be set in filter
     */
    setHighValue(value) {
      this.onUpdateFilter({
        values: [get(this, 'filter.values.firstObject'), Moment(value).format('YYYY-MM-DD')]
      });
    }
  }
});
