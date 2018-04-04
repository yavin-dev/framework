/**
 * Copyright 2018, Yahoo Holdings Inc.
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

import Ember from 'ember';
import { dataByDimensions } from 'navi-visualizations/utils/data';

import layout from '../../../templates/components/visualization-config/chart-type/dimension';
import _ from 'lodash';

const { computed, get, set, copy } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property classNames
   */
  classNames: ['dimension-line-chart-config'],

  /**
   * @property {Array} metrics
   */
  metrics: computed.alias('request.metrics'),

  /**
   * @property {Array} dimensions
   */
  dimensions: computed('request', function() {
    return Ember.A(get(this, 'request.dimensions')).mapBy('dimension');
  }),

  /**
   * @property {Object} selectedMetric
   */
  selectedMetric: computed('seriesConfig', function() {
    let metric = get(this, 'seriesConfig.metric');
    return Ember.A(get(this, 'metrics')).findBy('canonicalName', metric);
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

      for(let dimIndex = 0; dimIndex < dimensions.length; dimIndex++) {
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
        Ember.assign(values, { [get(dimension, 'name')] : id });
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
    return _.values(get(this, 'seriesByDimensions'));
  }),

  /**
   * @property {Array} selectedSeriesData - selected chart series data in the form:
   * [{searchKey: '...', dimensions: [{dimension: dimModel, value: {id: dimValueId, description: dimValDesc}}, ...]}, ...]
   */
  selectedSeriesData: computed('seriesConfig', function() {
    let dimensionOrder = get(this, 'seriesConfig.dimensionOrder'),
        selectedDimensions = get(this, 'seriesConfig.dimensions');

    let keys = Ember.A(selectedDimensions).mapBy('values').map(
      value => dimensionOrder.map(dimension => value[dimension]).join('|')
    );
    return keys.map(key => get(this, 'seriesByDimensions')[key]);
  }),

  /**
   * Actions
   */
  actions: {
    /**
     * @method onUpdateChartMetric
     * @param {Object} metric
     */
    onUpdateChartMetric(metric) {
      let newSeriesConfig = copy(get(this, 'seriesConfig'));
      set(newSeriesConfig, 'metric', get(metric, 'canonicalName'));
      this.sendAction('onUpdateConfig', newSeriesConfig);
    },

    /**
     * @method onAddSeries
     * @param {Object} series
     */
    onAddSeries(series) {
      let newSeriesConfig = copy(get(this, 'seriesConfig'));
      Ember.A(newSeriesConfig.dimensions).pushObject(series.config);
      this.sendAction('onUpdateConfig', newSeriesConfig);
    },

    /**
     * @method onRemoveSeries
     * @param {Object} series
     */
    onRemoveSeries(series) {
      let seriesInConfig = get(this, 'seriesConfig.dimensions'),
          newSeriesConfig = copy(get(this, 'seriesConfig'));

          //remove series from config
      set(newSeriesConfig, 'dimensions',
        _.reject(seriesInConfig, series.config)
      );
      this.sendAction('onUpdateConfig', newSeriesConfig);
    }
  }
});
