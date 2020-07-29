/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';

/**
 * @function getSelectedMetricsOfBase
 * @param metricMetadataModel - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of selected metrics of given meta type
 */
export function getSelectedMetricsOfBase(metricMetadataModel, request) {
  return request.columns.filter(
    column => column.type === 'metric' && column.columnMetadata?.id === metricMetadataModel.id
  );
}

/**
 * @function getFilteredMetricsOfBase
 * @param metricMetadataModel - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of filtered metrics of given meta type
 */
export function getFilteredMetricsOfBase(metricMetadataModel, request) {
  return request.filters.filter(
    filter => filter.type === 'metric' && filter.columnMetadata?.id === metricMetadataModel.id
  );
}

/**
 * @function getUnfilteredMetricsOfBase
 * @param metricMetadataModel - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of unfiltered metrics of given meta type
 */
export function getUnfilteredMetricsOfBase(metricMetadataModel, request) {
  const selectedMetrics = getSelectedMetricsOfBase(metricMetadataModel, request);
  const filteredMetrics = getFilteredMetricsOfBase(metricMetadataModel, request);
  const filteredMetricNames = arr(filteredMetrics).mapBy('canonicalName');

  return arr(selectedMetrics).reject(metricColumn => filteredMetricNames.includes(metricColumn.canonicalName));
}
