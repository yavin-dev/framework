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
import { oneWay } from '@ember/object/computed';
import Component from '@ember/component';
import Moment from 'moment';
import layout from '../../templates/components/filter-values/date';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['filter-values--date'],

  /**
   * @property {String} date - the date that's saved in the filter
   */
  date: oneWay('filter.values.firstObject'),

  actions: {
    /**
     * @action setDate
     * @param {Date} date - new date to set in filter
     */
    setDate(date) {
      this.onUpdateFilter({
        values: [Moment(date).format('YYYY-MM-DD')]
      });
    }
  }
});
