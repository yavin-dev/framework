/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isEmpty } from '@ember/utils';
import { get } from '@ember/object';

type Parameters = Record<string, unknown>;
interface ColumnAttributes {
  name: string;
  parameters: Parameters;
}

interface MetricObject {
  metric: string;
  parameters?: Parameters;
}

/**
 * Returns a metric object given column attributes
 * @function mapColumnAttributes
 * @param attributes - column attributes
 * @returns object with metric name and parameters
 */
export function mapColumnAttributes(attributes: ColumnAttributes): MetricObject {
  let metric = get(attributes, 'name'),
    parameters = get(attributes, 'parameters') || {};

  if (isEmpty(metric)) {
    throw new Error('Metric Column Attributes Mapper: Error, empty metric name');
  }

  return { metric, parameters };
}

/**
 * @function hasParameters
 * @param metric
 * @returns true if metric has parameters
 */
export function hasParameters(metric: MetricObject = { metric: '', parameters: {} }): boolean {
  let parameters = metric.parameters || {};
  return !isEmpty(parameters) && Object.keys(parameters).length > 0;
}

/**
 * Returns a seriailzed list of parameters
 * @function serializeParameters
 * @param obj - a key: value object of parameters
 */
export function serializeParameters(obj: Parameters = {}): string {
  let paramArray = Object.entries(obj);
  // TODO remove this line when aliases are natively supported in the fact web service
  paramArray = paramArray.filter(([key]) => key.toLowerCase() !== 'as');
  paramArray.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  return paramArray
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}

/**
 * Returns canonicalized name of a paramterized metric
 * @function canonicalizeMetric
 * @param metric
 */
export function canonicalizeMetric(metric: MetricObject): string {
  return hasParameters(metric) ? `${metric.metric}(${serializeParameters(metric.parameters)})` : metric.metric;
}

/**
 * Returns canonicalized name given metric column attributes
 * @function canonicalizeColumnAttributes
 * @param attributes
 */
export function canonicalizeColumnAttributes(attributes: ColumnAttributes): string {
  return canonicalizeMetric(mapColumnAttributes(attributes));
}

/**
 * Returns a map of aliases to canonicalized metrics to help with alias lookup.
 * @function getAliasedMetrics
 * @param metrics - list of metric objects from a request
 * @returns list of canonicalized metric names keyed by alias
 */
export function getAliasedMetrics(metrics: MetricObject[] = []): Dict<string> {
  return metrics.reduce((obj, metric) => {
    const { parameters = {} } = metric;
    if (hasParameters(metric) && 'as' in parameters) {
      return Object.assign({}, obj, {
        [`${parameters.as}`]: canonicalizeMetric(metric)
      });
    }
    return obj;
  }, {});
}

/**
 * Returns a canonicalized metric given an alias
 * Needs the alias map from getAliasedMetrics, this setup so can curry it
 * @function canonicalizeAlias
 * @param alias - the alias string
 * @param aliasMap - key value of alias -> canonicalizedName
 * @returns  canonicalised metric, or alias if not found
 */
export function canonicalizeAlias(alias: string, aliasMap: Dict<string> = {}): string {
  return aliasMap[alias] || alias;
}

/**
 * Returns a metric object given a canonical name
 * @function parseMetricName
 * @param canonicalName - the metric's canonical name
 * @returns object with base metric and parameters
 */
export function parseMetricName(canonicalName: string | MetricObject): MetricObject {
  if (typeof canonicalName !== 'string') {
    return canonicalName;
  }

  /*
   * extracts the parameter string from the metric that's between parenthesis
   * `baseName(parameter string)` => extracts `parameter string`
   */
  const paramRegex = /\((.*)\)$/;
  const stringParams = paramRegex.exec(canonicalName);

  let metric = canonicalName;
  let parameters = {};

  if (stringParams) {
    let paramStr = stringParams[1] || '';

    if (!paramStr.includes('=')) {
      throw new Error('Metric Parameter Parser: Error, invalid parameter list');
    }

    metric = canonicalName.slice(0, canonicalName.indexOf('('));
    parameters = paramStr
      .split(',')
      .map(paramEntry => paramEntry.split('='))
      .reduce((obj, [key, val]) => Object.assign({}, obj, { [key.trim()]: val }), {});
  }

  // validation
  if (isEmpty(metric)) {
    throw new Error('Metric Name Parser: Error, empty metric name');
  }

  if (metric.includes(')') || metric.includes('(')) {
    throw new Error('Metric Name Parser: Error, could not parse name');
  }

  return {
    metric,
    parameters
  };
}
