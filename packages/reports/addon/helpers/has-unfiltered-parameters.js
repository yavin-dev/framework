/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Helper from '@ember/component/helper';
import { observer, set } from '@ember/object';
import { getSelectedMetricsOfBase, getUnfilteredMetricsOfBase } from 'navi-reports/utils/request-metric';

export default Helper.extend({
  /*
   * @observer onFilterOrMetricChange
   * Forces recompute when request metrics or havings change
   */
  onFilterOrMetricChange: observer('request.metrics.[]', 'request.having.[]', function() {
    this.recompute();
  }),

  compute([metricMeta, request]) {
    set(this, 'request', request);

    let hasMetric = !!getSelectedMetricsOfBase(metricMeta, request).length,
      hasUnfilteredMetrics = !!getUnfilteredMetricsOfBase(metricMeta, request).length;

    return !hasMetric || hasUnfilteredMetrics;
  }
});
