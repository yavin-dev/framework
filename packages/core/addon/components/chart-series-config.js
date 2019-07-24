/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{chart-series-collection
 *      allSeriesData=allSeriesData
 *      selectedSeriesData=selectedSeriesData
 *      seriesDimensions=dimensions
 *      maxSeries=maxSeries
 *      onAddSeries=(action 'onAddSeriesAction')
 *      onRemoveSeries=(action 'onRemoveSeriesAction')
 *   }}
 */
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { copy } from 'ember-copy';
import layout from '../templates/components/chart-series-config';

export default Component.extend({
  layout,

  seriesConfigDataKey: computed('seriesType', function() {
    return this.seriesType === 'dimension' ? 'dimensions' : 'metrics';
  }),

  seriesData: computed('seriesConfigDataKey', 'seriesConfig', function() {
    return get(this, `seriesConfig.${get(this, 'seriesConfigDataKey')}`);
  }),

  actions: {
    onReorderSeries(series) {
      const newSeriesConfig = copy(this.seriesConfig),
        seriesConfigDataKey = get(this, 'seriesConfigDataKey'),
        reverseSeries = copy(series).reverse();
      set(newSeriesConfig, seriesConfigDataKey, reverseSeries);
      this.onUpdateConfig(newSeriesConfig);
    }
  }
});
