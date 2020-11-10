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
import BaseDateSelector from './base-date';
import { action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import moment from 'moment';

export default class DimensionDateRange extends BaseDateSelector {
  /**
   * @property {String} startDate - date (YYYY-MM-DD) of beginning of interval
   */
  @readOnly('args.filter.values.0') startDate!: string;

  /**
   * @property {String} endDate - date (YYYY-MM-DD) of end of interval
   */
  @readOnly('args.filter.values.1') endDate!: string;

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
  setLowValue(value: string) {
    this.args.onUpdateFilter({
      values: [moment(value).format('YYYY-MM-DD'), this.endDate]
    });
  }

  /**
   * @action setHighValue
   * @param {String} value - last value to be set in filter
   */
  @action
  setHighValue(value: string) {
    this.args.onUpdateFilter({
      values: [this.startDate, moment(value).format('YYYY-MM-DD')]
    });
  }
}
