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
import Ember from 'ember';
import layout from '../../templates/components/filter-values/date-range';
import { get } from '@ember/object';

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['date-range'],

  actions: {
    /**
     * @action setInterval
     * @param {Interval} interval - new interval to set in filter
     */
    setInterval(interval) {
      if (get(this, 'filter.operator.id') === 'bet') {
        //Set the date range in a filter on a dimension with date values
        let intervalStr = interval.asStrings('YYYY-MM-DD');

        this.attrs.onUpdateFilter({
          values: [`${get(intervalStr, 'start')}/${get(intervalStr, 'end')}`]
        });
      } else {
        //Set the date range for the datetime filter
        this.attrs.onUpdateFilter({
          interval
        });
      }
    }
  }
});
