/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{chart-series-config
 *     seriesType=seriesType
 *     seriesConfig=seriesConfig
 *     onUpdateConfig=(action "onUpdateConfig")
 *   }}
 */
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { copy } from 'ember-copy';
import layout from '../templates/components/chart-series-config';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['line-chart-config__series-config'],

  /**
   * @property {String} seriesConfigDataKey - object key of `seriesConfig` to read from and update when reordering
   */
  seriesConfigDataKey: computed('seriesType', function() {
    return this.seriesType === 'dimension' ? 'dimensions' : 'metrics';
  }),

  /**
   * @property {Array} seriesData - array of series data in the form:
   * [{ metric: "adClicks", parameters: {} }, { ... }] for metrics or [{ name: "Dimension 1" }, { ... }] for dimensions
   */
  seriesData: computed('seriesConfigDataKey', 'seriesConfig', function() {
    return get(this, `seriesConfig.${get(this, 'seriesConfigDataKey')}`);
  }),

  /**
   * actions
   */
  actions: {
    /**
     * @method onReorderSeries
     * @param {Array} series - new order of series
     */
    onReorderSeries(series) {
      const newSeriesConfig = copy(this.seriesConfig),
        seriesConfigDataKey = get(this, 'seriesConfigDataKey');

      // lowest item in stack should be first in order. Using `flex-flow: column-reverse` when rendering
      const reverseSeries = copy(series).reverse();

      set(newSeriesConfig, seriesConfigDataKey, reverseSeries);
      this.onUpdateConfig(newSeriesConfig);
    }
  }
});
