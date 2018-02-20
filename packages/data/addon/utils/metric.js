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
  // TODO remove this line when aliases are natively supported in the fact web service
  paramArray = paramArray.filter(([key, ]) => key.toLowerCase() !== 'as');
  paramArray.sort(([keyA, ], [keyB, ]) => keyA.localeCompare(keyB));
  return paramArray.map(([key, value]) => `${key}=${value}`).join(',');
}

/**
 * Returns a map of aliases to canonicalized metrics to help with alias lookup.
 * @param metrics {Array} - list of metric objects from a request
 * @returns {object} - list of canonicalized metric names keyed by alias
 */
export function getAliasedMetrics(metrics = []) {
  return metrics.reduce((obj, metric) => {
    if(hasParameters(metric) && 'as' in metric.parameters) {
      return Object.assign({}, obj, {[metric.parameters.as]: canonicalizeMetric(metric)});
    }
    return obj;
  },{});
}

/**
 * Returns a canonicalized metric given an alias
 * Needs the alias map from getAliasedMetrics, this setup so can curry it
 * @param alias {string} - the alias string
 * @param aliasMap {object} - key value of alias -> canonicalizedName
 * @returns {string} - canonicalised metric, or alias if not found
 */
export function canonicalizeAlias(alias, aliasMap = {}) {
  return aliasMap[alias] || alias;
}
