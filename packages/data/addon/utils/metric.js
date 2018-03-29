/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isEmpty } from '@ember/utils';
import { get } from '@ember/object';

/**
 * Returns canonicalized name of a paramterized metric
 * @function canonicalizeMetric
 * @param {Object} metric
 * @param {String} metric.metric - metric name
 * @param {Object} metric.parameters - a key: value object of parameters
 */
export function canonicalizeMetric(metric) {
  return hasParameters(metric) ? `${metric.metric}(${serializeParameters(metric.parameters)})` : metric.metric;
}

/**
 * @function hasParameters
 *
 * Returns if metric has parameters
 * @function hasParameters
 * @param {Object} obj
 * @param {String} obj.metric - metric name
 * @param {Object} obj.parameters (optional) - a key: value object of parameters
 * @returns {Boolean} true if metric has parameters
 */
export function hasParameters(obj = {}) {
  let parameters = get(obj, 'parameters');
  return !isEmpty(parameters) && Object.keys(parameters).length > 0;
}

/**
 * Returns a seriailzed list of parameters
 * @function serializeParameters
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
 * @function getAliasedMetrics
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
 * @function canonicalizeAlias
 * @param alias {string} - the alias string
 * @param aliasMap {object} - key value of alias -> canonicalizedName
 * @returns {string} - canonicalised metric, or alias if not found
 */
export function canonicalizeAlias(alias, aliasMap = {}) {
  return aliasMap[alias] || alias;
}

/**
 * Returns a metric object given a canonical name
 * @function parseMetricName
 * @param {String} str - the metric's canonical name
 * @returns {Object} - object with base metric and parameters
 */
export function parseMetricName(str) {
  let hasParameters = str.endsWith(')') && str.includes('('),
      metric = str,
      parameters = {};

  if(hasParameters) {
    /*
     * extracts the parameter string from the metric that's between parenthesis
     * `baseName(parameter string)` => extracts `parameter string`
     */
    let paramRegex = /\((.*)\)$/,
        results = paramRegex.exec(str),
        paramStr = results.length >= 2 ? results[1] : ''; // checks if capture group exists, and uses it if it does

    if(!paramStr.includes('=')) {
      throw new Error('Metric Parameter Parser: Error, invalid parameter list');
    }

    metric = str.slice(0, str.indexOf('('));
    parameters = paramStr.split(',').map(paramEntry => paramEntry.split('='))
      .reduce((obj, [key, val]) => Object.assign({}, obj, {[key]: val}), {});
  }

  // validation
  if(isEmpty(metric)) {
    throw new Error('Metric Name Parser: Error, empty metric name');
  }

  if(metric.includes(')') || metric.includes('(')) {
    throw new Error('Metric Name Parser: Error, could not parse name');
  }

  return {
    metric,
    parameters
  };
}
