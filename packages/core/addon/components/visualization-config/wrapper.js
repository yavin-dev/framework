/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/wrapper
 *    request=request
 *    response=response
 *    visualization=visualization
 *    onUpdateConfig=(action 'onUpdateConfig')
 * }}
 */

import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { getOwner } from '@ember/application';
import layout from '../../templates/components/visualization-config/wrapper';
import { getRequestMetrics } from 'navi-core/utils/chart-data';
import { copy } from 'ember-copy';

export default Component.extend({
  layout,

  classNames: ['visualization-config'],

  /**
   * @property {Object} seriesConfig
   */
  series: computed('visualization.metadata', function() {
    return get(this, 'visualization.metadata.axis.y.series');
  }),

  /**
   * @property {Object} seriesConfig
   */
  seriesConfig: computed('series', function() {
    return get(this, 'series.config');
  }),

  /**
   * @property {Boolean} showMetricSelect - whether to display the metric select
   */
  showMetricSelect: computed('visualization', 'series', function() {
    const series = get(this, 'series'),
      { visualization: { type }, request } = this,
      visualizationManifest = getOwner(this).lookup(`manifest:${type}`);

    return ['line-chart', 'bar-chart', 'pie-chart'].includes(type) &&
      series.type === 'dimension' &&
      visualizationManifest.hasMultipleMetrics(request);
  }),

  /**
   * @property {Object} selectedMetric
   */
  selectedMetric: computed('seriesConfig', function() {
    return get(this, 'seriesConfig.metric');
  }),

  /**
   * @property {Array} metrics
   */
  metrics: computed('request', function() {
    return getRequestMetrics(this.request);
  }),

  actions: {
    /**
     * @method onUpdateChartMetric
     * @param {Object} metric
     */
    onUpdateChartMetric(metric) {
      const newConfig = copy(get(this, 'visualization.metadata'));
      set(newConfig, 'axis.y.series.config.metric', metric);
      this.onUpdateConfig(newConfig);
    },
  }
});
