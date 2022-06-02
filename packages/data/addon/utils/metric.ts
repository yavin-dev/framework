/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { isEmpty } from '@ember/utils';
import FunctionParameterMetadataModel, { DataType } from 'navi-data/models/metadata/function-parameter';
import { isPresent } from '@ember/utils';
import type { Parameters, ParameterValue } from '@yavin/client/request';

interface MetricObject {
  metric: string;
  parameters?: Parameters;
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

export function parseParameterValue(
  parameter: FunctionParameterMetadataModel,
  rawParamValue: ParameterValue
): ParameterValue {
  const { defaultValue, valueType } = parameter;
  let paramValue: ParameterValue = isPresent(rawParamValue) ? rawParamValue : defaultValue ?? '';
  if ([DataType.INTEGER, DataType.DECIMAL].includes(valueType)) {
    paramValue = Number(rawParamValue);
  } else if (DataType.BOOLEAN === valueType) {
    paramValue = Boolean(rawParamValue);
  }
  return paramValue;
}
