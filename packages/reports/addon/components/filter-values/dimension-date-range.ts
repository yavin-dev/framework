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

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import Moment from 'moment';
import Args from './args-interface';

export default class DimensionDateRange extends Component<Args> {
  /**
   * @property {String} startDate - date (YYYY-MM-DD) of beginning of interval
   */
  @oneWay('args.filter.values.0') startDate: string | undefined;

  /**
   * @property {String} endDate - date (YYYY-MM-DD) of end of interval
   */
  @oneWay('args.filter.values.1') endDate: string | undefined;

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
  setLowValue(value: Moment.MomentInput) {
    this.args.onUpdateFilter({
      values: [Moment(value).format('YYYY-MM-DD'), this.args.filter.values?.[1]]
    });
  }

  /**
   * @action setHighValue
   * @param {String} value - last value to be set in filter
   */
  @action
  setHighValue(value: Moment.MomentInput) {
    this.args.onUpdateFilter({
      values: [this.args.filter.values?.[0], Moment(value).format('YYYY-MM-DD')]
    });
  }
}
