/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';
import { topN, maxDataByDimensions } from 'navi-visualizations/utils/data';
import {
  METRIC_SERIES,
  DIMENSION_SERIES,
  DATE_TIME_SERIES,
  getRequestMetrics,
  getRequestDimensions,
  buildDimensionSeriesValues
} from 'navi-visualizations/utils/chart-data';

const { get } = Ember;

export default Ember.Mixin.create({

  /**
   * Get a series builder based on type of chart
   *
   * @method getSeriesBuilder
   * @param {String} type - type of chart series
   * @returns {Object} a series builder function
   */
  getSeriesBuilder(type) {
    let builders = {
      [METRIC_SERIES]: this.buildMetricSeries,
      [DIMENSION_SERIES]: this.buildDimensionSeries,
      [DATE_TIME_SERIES]: this.buildDateTimeSeries
    };

    return builders[type];
  },

  /**
   * Rebuild dimension series attributes based on
   * request and response
   *
   * @method buildDimensionSeries
   * @param {Object} config - series config object
   * @param {Object} validations - validations object
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @returns {Object} series config object
   */
  buildDimensionSeries(config, validations, request, response) {

    let metricPath = `${config}.metric`,
        dimensionOrderPath = `${config}.dimensionOrder`,
        dimensionsPath =  `${config}.dimensions`,
        validationAttrs = get(validations, 'attrs');

    let isMetricValid = get(validationAttrs, `${metricPath}.isValid`),
        isDimensionOrderValid = get(validationAttrs, `${dimensionOrderPath}.isValid`),
        areDimensionsValid = get(validationAttrs, `${dimensionsPath}.isValid`);

    let metric = isMetricValid ? get(this, metricPath) : getRequestMetrics(request)[0],
        dimensionOrder = isDimensionOrderValid ? get(this, dimensionOrderPath) : getRequestDimensions(request),
        responseRows = topN(
          maxDataByDimensions(get(response, 'rows'), dimensionOrder, metric),
          metric, 10),
        dimensions = isDimensionOrderValid && areDimensionsValid ? get(this, dimensionsPath) : buildDimensionSeriesValues(request, responseRows);

    return {
      type: DIMENSION_SERIES,
      config: {
        metric,
        dimensionOrder,
        dimensions
      }
    };
  },

  /**
   * Rebuild metric series attributes based on
   * request and response
   *
   * @method buildMetricSeries
   * @param {Object} config - series config object
   * @param {Object} validations - validations object
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @returns {Object} series config object
   */
  buildMetricSeries(config, validations, request /*, response */) {
    return {
      type: METRIC_SERIES,
      config: {
        metrics: getRequestMetrics(request)
      }
    };
  },

  /**
   * Rebuild date time series attributes based on
   * request
   *
   * @method buildDateTimeSeries
   * @param {Object} config - series config object
   * @param {Object} validations - validations object
   * @param {Object} request - request object
   * @param {Object} response - response object
   * @returns {Object} series config object
   */
  buildDateTimeSeries(config, validations, request /*, response */) {
    return {
      type: DATE_TIME_SERIES,
      config: {
        metric: getRequestMetrics(request)[0],
        timeGrain: 'year'
      }
    };
  }
});
