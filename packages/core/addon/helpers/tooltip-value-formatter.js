/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';
import { smartFormatNumber } from 'navi-core/helpers/smart-format-number';

/**
 * Serves as an overridable hook for formatting numbers in tooltips
 *
 * @method tooltipValueFormatter
 * @param {Number|String} value
 * @param {Object} metric - Metric JSON Object
 * @param {Object} row - response row for the current value and metric
 * @return {String} Formatted string for the provided number
 */
export function tooltipValueFormatter([value /*, metric, rowData*/]) {
  return smartFormatNumber([value]);
}

export default Ember.Helper.helper(tooltipValueFormatter);
