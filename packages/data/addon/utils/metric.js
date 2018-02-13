/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isEmpty } from '@ember/utils';

/**
 * Returns canonicalized name of a paramterized metric
 * @param {Object} metric
 * @param {String} metric.metric - metric name
 * @param {Object} metric.parameters - a key: value object of parameters
 */
export function canonicalizeMetric(metric) {
  return hasParameters(metric) ? `${metric.metric}(${serializeParameters(metric.parameters)})` : metric.metric;
}

/**
 * Returns if metric has parameters
 * @param {Object} obj
 * @param {String} obj.metric - metric name
 * @param {Object} obj.parameters (optional) - a key: value object of parameters
 */
export function hasParameters(obj = {}) {
  return obj.hasOwnProperty('parameters') &&
    !isEmpty(obj.parameters) &&
    Object.keys(obj.parameters).length > 0
}

/**
 * Returns a seriailzed list of parameters
 * @param {Object} obj - a key: value object of parameters
 */
export function serializeParameters(obj = {}) {
  let paramArray = Object.entries(obj);
  paramArray.sort(([keyA, ], [keyB, ]) => keyA.localeCompare(keyB));
  return paramArray.map(([key, value]) => `${key}=${value}`).join(',');
}
