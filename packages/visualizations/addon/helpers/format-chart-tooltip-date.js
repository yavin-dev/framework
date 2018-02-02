/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import moment from 'moment';

const { get } = Ember;

const TOOLTIP_DATE_TIME_FORMAT = {
  second:  'MMM D HH:mm:ss',
  minute:  'MMM D HH:mm:00',
  hour:    'MMM D HH:00',
  day:     'MMMM D, YYYY',
  week:    'MMMM D, YYYY',
  month:   'MMM YYYY',
  quarter: '[Q]Q YYYY',
  year:    'YYYY'
};

/**
 * Formats the date based on request timeGrain
 *
 * @method chartToolTipFormat
 * @param {Object} request - request used to get data
 * @param {String} value
 * @return {String} Formatted date string for the provided date string
 */
export function formatChartTooltipDate(request, value) {
  if (request && value) {
    let granularity = get(request, 'logicalTable.timeGrain.name') || get(request, 'logicalTable.timeGrain');
    return moment(value).format(TOOLTIP_DATE_TIME_FORMAT[granularity]);
  }
}

export default Ember.Helper.helper( args => formatChartTooltipDate(...args) );
