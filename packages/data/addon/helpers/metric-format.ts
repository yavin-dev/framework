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
// @ts-ignore
import { getDefaultDataSourceName } from 'navi-data/utils/adapter';
import NaviFormatterService from '../services/navi-formatter';
import Metric from '../models/metadata/metric';
import NaviMetadataService from 'navi-data/services/navi-metadata';

export default class MetricFormatHelper extends Helper {
  @service
  private naviMetadata!: NaviMetadataService;

  @service
  private naviFormatter!: NaviFormatterService;

  /**
   * returns formatted metric
   * @param {object} metric - serialized bard-request metric fragment
   * @param {string} namespace - The source of the metric
   * @param {string} alias - An alias to use instead of the name of the metric
   * @returns {string} - formatted metric
   */
  compute([metric, namespace = getDefaultDataSourceName(), alias /*...rest*/]: [TODO?, string?, string?]): string {
    const metricMeta = this.naviMetadata.getById('metric', metric?.metric, namespace) as Metric | undefined;
    if (metricMeta) {
      return this.naviFormatter.formatMetric(metricMeta, metric?.parameters, alias);
    }
    return this.naviFormatter.formatMetric({ name: metric?.metric } as Metric, metric?.parameters, alias);
  }
}
