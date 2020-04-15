/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Helper that formats metrics for display
 * usage:
 *   {{metric-format metric}}
 *
 */

import { inject as service } from '@ember/service';
import { hasParameters } from '../utils/metric';
import { isPresent } from '@ember/utils';
import Helper from '@ember/component/helper';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';

function _formatParameters(obj) {
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
export function metricFormat(metric, longName = '--') {
  return isPresent(metric) && hasParameters(metric)
    ? `${longName} (${_formatParameters(metric.parameters)})`
    : longName;
}

export default class MetricFormatHelper extends Helper {
  /**
   * @property {Service} metricName
   */
  @service metricName;

  /**
   * returns formatted metric
   * @param metric - serialized bard-request metric fragment
   * @returns {string} - formatted metric
   */
  compute([metric, namespace = getDefaultDataSourceName() /*...rest*/]) {
    let longName = '--';
    if (!metric) {
      return longName;
    }

    const metricId = metric.metric;
    if (isPresent(metricId)) {
      longName = this.metricName.getLongName(metricId, namespace);
    }
    return metricFormat(metric, longName);
  }
}
