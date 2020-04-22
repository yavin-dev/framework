/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service, { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { hasParameters } from '../utils/metric';

function _formatParameters(obj: object) {
  return Object.entries(obj)
    .filter(([key]) => key !== 'as')
    .map(([, val]) => val)
    .join(',');
}

/**
 * Formats a metric given the longName
 * @param {object} metric - bard-request metric fragment
 * @param {string} longName - longname from metric meta data
 * @returns {string} - formatted string
 */
function metricFormat(metric: TODO, longName = '--'): string {
  return isPresent(metric) && hasParameters(metric)
    ? `${longName} (${_formatParameters(metric.parameters)})`
    : longName;
}

export default class NaviFormatterService extends Service {
  /**
   * @property {Service} metricName
   */
  @service metricName!: TODO;

  formatMetric(metric: TODO, longName = '--') {
    return metricFormat(metric, longName);
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-formatter': NaviFormatterService;
  }
}
