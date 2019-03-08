/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/range-input
 *       filter=filter
 *       onUpdateFilter=(action 'update')
 *       lowPlaceholder=lowPlaceholder
 *       highPlaceholder=highPlaceholder
 *   }}
 */

import Component from '@ember/component';

import { get } from '@ember/object';
import layout from '../../templates/components/filter-values/range-input';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-values--range-input'],

  /**
   * @property {String} lowPlaceholder
   */
  lowPlaceholder: 'Low value',

  /**
   * @property {String} highPlaceholder
   */
  highPlaceholder: 'High value',

  actions: {
    /**
     * @action setLowValue
     * @param {String} value - first value to be set in filter
     */
    setLowValue(value) {
      this.onUpdateFilter({
        values: [value, get(this, 'filter.values.lastObject')]
      });
    },

    /**
     * @action setHighValue
     * @param {String} value - last value to be set in filter
     */
    setHighValue(value) {
      this.onUpdateFilter({
        values: [get(this, 'filter.values.firstObject'), value]
      });
    }
  }
});
