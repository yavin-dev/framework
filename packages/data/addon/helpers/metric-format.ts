/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: Helper that formats metrics for display
 * usage:
 *   {{metric-format metric}}
 *
 */

import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import NaviFormatterService from '../services/navi-formatter';
import Metric from '../models/metadata/metric';

export default class MetricFormatHelper extends Helper {
  /**
   * @property {Service} bardMetadata
   */
  @service('bard-metadata') bardMetadata!: TODO;

  /**
   * @property {Service} metricName
   */
  @service('navi-formatter') naviFormatter!: NaviFormatterService;

  /**
   * returns formatted metric
   * @param {object} metric - serialized bard-request metric fragment
   * @param {string} namespace - The source of the metric
   * @param {string} alias - An alias to use instead of the name of the metric
   * @returns {string} - formatted metric
   */
  compute([metric, namespace = getDefaultDataSourceName(), alias /*...rest*/]: [TODO?, string?, string?]): string {
    const metricMeta = this.bardMetadata.getById('metric', metric?.metric, namespace) as Metric | undefined;
    if (metricMeta) {
      return this.naviFormatter.formatMetric(metricMeta, metric?.parameters, alias);
    }
    return this.naviFormatter.formatMetric({ name: metric?.metric } as Metric, metric?.parameters, alias);
  }
}
