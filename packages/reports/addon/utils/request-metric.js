/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A as arr } from '@ember/array';
import { get } from '@ember/object';

/**
 * @function getSelectedMetricsOfBase
 * @param metricMeta - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of selected metrics of given meta type
 */
export function getSelectedMetricsOfBase(metricMeta, request) {
  return arr(get(request, 'metrics'))
    .filterBy('metric.name', get(metricMeta, 'name'));
}

/**
 * @function getFilteredMetricsOfBase
 * @param metricMeta - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of filtered metrics of given meta type
 */
export function getFilteredMetricsOfBase(metricMeta, request) {
  return arr(get(request, 'having'))
    .filterBy('metric.metric.name', get(metricMeta, 'name'));
}

/**
 * @function getUnfilteredMetricsOfBase
 * @param metricMeta - metadata for metricClicked
 * @param request - request object
 * @returns {Array} - array of unfiltered metrics of given meta type
 */
export function getUnfilteredMetricsOfBase(metricMeta, request) {
  let selected = getSelectedMetricsOfBase(metricMeta, request),
      filtered = getFilteredMetricsOfBase(metricMeta, request),
      filteredMetricNames = arr(filtered).mapBy('metric.canonicalName');

  return arr(selected).reject(
    metric => arr(filteredMetricNames).contains(get(metric, 'canonicalName'))
  );
}
