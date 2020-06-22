/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import DataGroup from 'navi-core/utils/classes/data-group';
import { getDimensionGroupingField } from 'navi-core/utils/data';

export const METRIC_SERIES = 'metric';
export const DIMENSION_SERIES = 'dimension';
export const DATE_TIME_SERIES = 'dateTime';

/**
 * Group data by dimensions
 *
 * @method groupDataByDimensions
 * @param {Array} rows - rows from bard response
 * @param {Array} config.dimensions - list of dimensions to chart
 * @returns {DataGroup} rows grouped by composite key
 */
export function groupDataByDimensions(rows, config) {
  let dimensionOrder = config.dimensionOrder,
    byDimensions = new DataGroup(rows, row =>
      dimensionOrder.map(dimension => row[getDimensionGroupingField([row], dimension)]).join('|')
    );

  return byDimensions;
}

/**
 * Build series key
 *
 * @method buildSeriesKey
 * @param {Array} config.dimensions - list of dimensions to chart
 * @returns {series} the built series
 */
export function buildSeriesKey(config) {
  let dimensionOrder = config.dimensionOrder,
    series = config.dimensions;

  return series.map(s => dimensionOrder.map(dimension => s.values[dimension]).join('|'));
}

/**
 * Get series name
 *
 * @method getSeriesName
 * @param {Array} config.dimensions - list of dimensions to chart
 * @returns {seriesName} series Name
 */
export function getSeriesName(config) {
  let series = config.dimensions;

  // Return the series name in an array
  return series.map(s => s.name);
}

/**
 * Determine chart type based on request
 *
 * @function chartTypeForRequest
 * @param {Object} request - request object
 * @returns {Boolean}
 */
export function chartTypeForRequest(request) {
  let dimensionCount = request.dimensions?.length;

  if (dimensionCount > 0) {
    return DIMENSION_SERIES;
  }

  let metricCount = request.metrics?.length,
    timeGrain = request.logicalTable?.timeGrain,
    interval = request.intervals?.firstObject?.interval,
    monthPeriod = interval.diffForTimePeriod('month'),
    applicableTimeGrain = ['day', 'week', 'month'].includes(timeGrain);

  if (metricCount === 1 && monthPeriod > 12 && applicableTimeGrain) {
    return DATE_TIME_SERIES;
  }

  return METRIC_SERIES;
}

/**
 * Returns a list of metrics from the request
 *
 * @function getRequestMetrics
 * @param {Object} request - request object
 * @returns {Array} - list of metric JSON objects
 */
export function getRequestMetrics(request) {
  return request.metrics.map(metric => metric.toJSON());
}

/**
 * Returns a list of dimensions id from the request
 *
 * @function getRequestDimensions
 * @param {Object} request - request object
 * @returns {Array} - list of dimension ids
 */
export function getRequestDimensions(request) {
  return arr(request.dimensions).mapBy('dimension.id');
}

/**
 * Returns an object for the dimension series values
 *
 * @function buildDimensionSeriesValues
 * @param {Object} request - request object
 * @param {Array} rows  - response rows
 * @returns {Object} - config series values object
 */
export function buildDimensionSeriesValues(request, rows) {
  let series = {};

  let requestDimensions = getRequestDimensions(request);
  rows.forEach(row => {
    let values = {},
      dimensionLabels = [];
    requestDimensions.forEach(dimension => {
      const id = row[getDimensionGroupingField([row], dimension)],
        desc = row[`${dimension}|desc`];

      values[dimension] = id;
      dimensionLabels.push(desc || id);
    });

    //Use object key to dedup dimension value combinations
    series[Object.values(values).join('|')] = {
      name: dimensionLabels.join(','),
      values
    };
  });

  return Object.values(series);
}
