/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * {{visualization-config/chart-type/dimension
 *    request=request
 *    response=response
 *    seriesConfig=seriesConfig
 *    maxSeries=maxSeries
 *    onUpdateConfig=(action 'onUpdateChartConfig')
 * }}
 */

import { assign } from '@ember/polyfills';
import { A as arr } from '@ember/array';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';
import { copy } from 'ember-copy';
import { dataByDimensions } from 'navi-core/utils/data';
import { getRequestMetrics } from 'navi-core/utils/chart-data';
import layout from '../../../templates/components/visualization-config/chart-type/dimension';
import values from 'lodash/values';
import reject from 'lodash/reject';

export default Component.extend({
  layout,

  /**
   * @property classNames
   */
  classNames: ['dimension-line-chart-config'],

  /**
   * @property {Array} metrics
   */
  metrics: computed('request', function() {
    return getRequestMetrics(get(this, 'request'));
  }),

  /**
   * @property {Array} dimensions
   */
  dimensions: computed('request', function() {
    return arr(get(this, 'request.dimensions')).mapBy('dimension');
  }),

  /**
   * @property {DataGroup} dataByDimensions - response data grouped by dimension composite keys
   */
  dataByDimensions: computed('seriesConfig', 'response', function() {
    return dataByDimensions(get(this, 'response'), get(this, 'seriesConfig.dimensionOrder'));
  }),

  /**
   * @property {Object} seriesByDimensions - series objects grouped by dimension composite keys
   */
  seriesByDimensions: computed('dataByDimensions', function() {
    let dataByDimensions = get(this, 'dataByDimensions'),
      dimensions = get(this, 'dimensions'),
      keys = dataByDimensions.getKeys(),
      series = {};

    // Build a series object for each series key
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i],
        data = dataByDimensions.getDataForKey(key);

      /*
       * Build a search key by adding all dimension ids + descriptions
       * along with a collection of dimensions used by series
       */
      let searchKey = '',
        seriesDims = [],
        values = {},
        dimensionLabels = [];

      for (let dimIndex = 0; dimIndex < dimensions.length; dimIndex++) {
        // Pull dimension id + description from response data
        let dimension = dimensions[dimIndex],
          id = get(data, `0.${dimension.name}|id`),
          description = get(data, `0.${dimension.name}|desc`);

        searchKey += `${id} ${description} `;

        seriesDims.push({
          dimension,
          value: {
            id,
            description
          }
        });

        dimensionLabels.push(description || id);
        assign(values, { [get(dimension, 'name')]: id });
      }

      series[key] = {
        searchKey: searchKey.trim(),
        dimensions: seriesDims,
        config: {
          name: dimensionLabels.join(','),
          values
        }
      };
    }

    return series;
  }),

  /**
   * @property {Array} allSeriesData - all possible chart series data in the form:
   * [{searchKey: '...', dimensions: [{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...]}, ...]
   */
  allSeriesData: computed('seriesByDimensions', function() {
    return values(get(this, 'seriesByDimensions'));
  }),

  /**
   * @property {Array} selectedSeriesData - selected chart series data in the form:
   * [{searchKey: '...', dimensions: [{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...]}, ...]
   */
  selectedSeriesData: computed('seriesConfig', function() {
    let dimensionOrder = get(this, 'seriesConfig.dimensionOrder'),
      selectedDimensions = get(this, 'seriesConfig.dimensions');

    let keys = arr(selectedDimensions)
      .mapBy('values')
      .map(value => dimensionOrder.map(dimension => value[dimension]).join('|'));
    return keys.map(key => get(this, 'seriesByDimensions')[key]);
  }),

  /**
   * Actions
   */
  actions: {
    /**
     * @method onAddSeries
     * @param {Object} series
     */
    onAddSeries(series) {
      const newSeriesConfig = copy(get(this, 'seriesConfig'));
      const handleUpdateConfig = get(this, 'onUpdateConfig');

      arr(newSeriesConfig.dimensions).pushObject(series.config);
      if (handleUpdateConfig) handleUpdateConfig(newSeriesConfig);
    },

    /**
     * @method onRemoveSeries
     * @param {Object} series
     */
    onRemoveSeries(series) {
      const seriesInConfig = get(this, 'seriesConfig.dimensions');
      const newSeriesConfig = copy(get(this, 'seriesConfig'));
      const handleUpdateConfig = get(this, 'onUpdateConfig');

      //remove series from config
      set(newSeriesConfig, 'dimensions', reject(seriesInConfig, series.config));
      if (handleUpdateConfig) handleUpdateConfig(newSeriesConfig);
    }
  }
});
