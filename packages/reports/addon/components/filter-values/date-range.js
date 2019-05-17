/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-values/date-range
 *       filter=filter
 *       request=request
 *       onUpdateFilter=(action 'update')
 *   }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/filter-values/date-range';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-values--date-range'],

  actions: {
    /**
     * @action setInterval
     * @param {Interval} interval - new interval to set in filter
     */
    setInterval(interval) {
      this.onUpdateFilter({
        interval
      });
    }
  }
});
