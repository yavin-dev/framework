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
import Helper from '@ember/component/helper';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import { isPresent } from '@ember/utils';
import NaviFormatterService from '../services/navi-formatter';
import MetricNameService from '../services/metric-name';

export default class MetricFormatHelper extends Helper {
  /**
   * @property {Service} metricName
   */
  @service('metric-name') metricName!: MetricNameService;

  /**
   * @property {Service} metricName
   */
  @service('navi-formatter') naviFormatter!: NaviFormatterService;

  /**
   * returns formatted metric
   * @param metric - serialized bard-request metric fragment
   * @returns {string} - formatted metric
   */
  compute([metric, namespace = getDefaultDataSourceName() /*...rest*/]: [TODO, string]) {
    let longName = '--';
    if (!metric) {
      return longName;
    }

    const metricId = metric.metric;
    if (isPresent(metricId)) {
      longName = this.metricName.getLongName(metricId, namespace);
    }
    return this.naviFormatter.formatMetric(metric, longName);
  }
}
