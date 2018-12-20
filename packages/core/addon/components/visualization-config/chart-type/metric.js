/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/chart-type/metric
 *    request=request
 *    response=response
 *    seriesConfig=seriesConfig
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import Ember from 'ember';
import layout from '../../../templates/components/visualization-config/chart-type/metric';
import { computedSetDiff } from 'navi-core/utils/custom-computed-properties';

const { computed, get, set, copy } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['metric-line-chart-config'],

  /**
   * @property {String} chartSeriesClass - chart series class name to be applied to the dropdown
   */
  chartSeriesClass: computed('selectedMetrics', function() {
    return `chart-series-${get(this, 'selectedMetrics.length')}`;
  }),

  /**
   * @property {Array} metrics - request metric
   */
  metrics: computed('request', function() {
    return Ember.A(get(this, 'request.metrics')).mapBy('metric');
  }),

  /**
   * @property {Array} selectedMetrics
   */
  selectedMetrics: computed('seriesConfig', function() {
    let selectedMetrics = get(this, 'seriesConfig.metrics');

    return Ember.A(get(this, 'metrics')).filter(metric => {
      return Ember.A(selectedMetrics).includes(metric.name);
    });
  }),

  /**
   * @property {Array} unselectedMetrics
   */
  unselectedMetrics: computedSetDiff('metrics', 'selectedMetrics'),

  actions: {
    /**
     * @method onUpdateMetric
     * @param {Array} selectedMetrics
     */
    onUpdateMetrics(selectedMetrics) {
      let metrics = Ember.A(selectedMetrics).mapBy('name'),
        newConfig = copy(get(this, 'seriesConfig'));
      set(newConfig, 'metrics', metrics);
      this.sendAction('onUpdateConfig', newConfig);
    },

    /**
     * @method onRemoveSeries
     * @param {Object} metric
     */
    onRemoveSeries(metric) {
      let selectedMetrics = Ember.A(get(this, 'selectedMetrics')),
        updatedMetrics = Ember.A(selectedMetrics.mapBy('name')).removeObject(metric.name),
        newConfig = copy(get(this, 'seriesConfig'));

      set(newConfig, 'metrics', updatedMetrics);
      this.sendAction('onUpdateConfig', newConfig);
    }
  }
});
