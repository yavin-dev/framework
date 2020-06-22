/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <Filter::Values::DimensionDateRange
 *     @filter={{this.filter}}
 *     @onUpdateFilter={{this.update}}
 *   />
 */

import Component from '@ember/component';
import { get, action } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import Moment from 'moment';
import layout from '../../templates/components/filter-values/dimension-date-range';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class DimensionDateRange extends Component {
  /**
   * @property {String} startDate - date (YYYY-MM-DD) of beginning of interval
   */
  @oneWay('filter.values.firstObject') startDate;

  /**
   * @property {String} endDate - date (YYYY-MM-DD) of end of interval
   */
  @oneWay('filter.values.lastObject') endDate;

  /**
   * @property {String} lowPlaceholder
   */
  lowPlaceholder = 'Since';

  /**
   * @property {String} highPlaceholder
   */
  highPlaceholder = 'Before';

  /**
   * @action setLowValue
   * @param {String} value - first value to be set in filter
   */
  @action
  setLowValue(value) {
    this.onUpdateFilter({
      values: [Moment(value).format('YYYY-MM-DD'), get(this, 'filter.values.lastObject')]
    });
  }

  /**
   * @action setHighValue
   * @param {String} value - last value to be set in filter
   */
  @action
  setHighValue(value) {
    this.onUpdateFilter({
      values: [get(this, 'filter.values.firstObject'), Moment(value).format('YYYY-MM-DD')]
    });
  }
}
