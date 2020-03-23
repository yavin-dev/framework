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
 * @param {String} metric.metric - metric id
 * @param {Object} metric.parameters - a key: value object of parameters
 */
export function canonicalizeMetric(metric) {
  return hasParameters(metric) ? `${metric.metric}(${serializeParameters(metric.parameters)})` : metric.metric;
}

/**
 * Returns canonicalized name given metric column attributes
 * @function canonicalizeColumnAttributes
 * @param {Object} attributes
 * @param {String} attributes.id - metric id
 * @param {Object} attributes.parameters - a key: value object of parameters
 */
export function canonicalizeColumnAttributes(attributes) {
  return canonicalizeMetric(mapColumnAttributes(attributes));
}

/**
 * @function hasParameters
 *
 * Returns if metric has parameters
 * @function hasParameters
 * @param {Object} obj
 * @param {String} obj.metric - metric id
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
  paramArray = paramArray.filter(([key]) => key.toLowerCase() !== 'as');
  paramArray.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  return paramArray.map(([key, value]) => `${key}=${value}`).join(',');
}

/**
 * Returns a map of aliases to canonicalized metrics to help with alias lookup.
 * @function getAliasedMetrics
 * @param metrics {Array} - list of metric objects from a request
 * @returns {object} - list of canonicalized metric ids keyed by alias
 */
export function getAliasedMetrics(metrics = []) {
  return metrics.reduce((obj, metric) => {
    if (hasParameters(metric) && 'as' in metric.parameters) {
      return Object.assign({}, obj, {
        [metric.parameters.as]: canonicalizeMetric(metric)
      });
    }
    return obj;
  }, {});
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
 * @param {String} canonicalName - the metric's canonical name
 * @returns {Object} - object with base metric and parameters
 */
export function parseMetricName(canonicalName) {
  if (typeof canonicalName !== 'string') {
    return canonicalName;
  }

  let hasParameters = canonicalName.endsWith(')') && canonicalName.includes('('),
    metric = canonicalName,
    parameters = {};

  if (hasParameters) {
    /*
     * extracts the parameter string from the metric that's between parenthesis
     * `baseName(parameter string)` => extracts `parameter string`
     */
    let paramRegex = /\((.*)\)$/,
      results = paramRegex.exec(canonicalName),
      paramStr = results.length >= 2 ? results[1] : ''; // checks if capture group exists, and uses it if it does

    if (!paramStr.includes('=')) {
      throw new Error('Metric Parameter Parser: Error, invalid parameter list');
    }

    metric = canonicalName.slice(0, canonicalName.indexOf('('));
    parameters = paramStr
      .split(',')
      .map(paramEntry => paramEntry.split('='))
      .reduce((obj, [key, val]) => Object.assign({}, obj, { [key]: val }), {});
  }

  // validation
  if (isEmpty(metric)) {
    throw new Error('Metric Name Parser: Error, empty metric id');
  }

  if (metric.includes(')') || metric.includes('(')) {
    throw new Error('Metric Name Parser: Error, could not parse id');
  }

  return {
    metric,
    parameters
  };
}

/**
 * Returns a metric object given column attributes
 * @function mapColumnAttributes
 * @param {Object} attributes - column attributes
 * @param {String} attributes.id - metric id
 * @param {Object} attributes.parameters - metric parameters
 * @returns {Object} - object with metric id and parameters
 */
export function mapColumnAttributes(attributes) {
  let metric = get(attributes, 'id'),
    parameters = get(attributes, 'parameters') || {};

  if (isEmpty(metric)) {
    throw new Error('Metric Column Attributes Mapper: Error, empty metric id');
  }

  return { metric, parameters };
}
