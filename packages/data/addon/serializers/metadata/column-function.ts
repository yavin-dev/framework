/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A serializer for the metric function endpoint
 */

import EmberObject from '@ember/object';
import { RawColumnFunctionArguments, RawColumnFunction } from './bard';
import { ColumnFunctionMetadataPayload } from 'navi-data/models/metadata/column-function';
import {
  FunctionParameterMetadataPayload,
  INTRINSIC_VALUE_EXPRESSION,
} from 'navi-data/models/metadata/function-parameter';

type RawMetricFunctionPayload = {
  'metric-functions': {
    rows: RawColumnFunction[];
  };
};

/**
 * @param parameters - raw column function parameters
 * @param source - data source name
 */
export function constructFunctionParameters(
  parameters: RawColumnFunctionArguments,
  source: string
): FunctionParameterMetadataPayload[] {
  return Object.keys(parameters).map((paramName) => {
    const param = parameters[paramName];
    const { defaultValue, description } = param;

    const normalized: FunctionParameterMetadataPayload = {
      id: paramName,
      name: paramName,
      description,
      valueType: 'ref', // It will always be ref for our case because all our parameters have their valid values defined in a dimension or enum
      expression: param.type === 'dimension' ? `dimension:${param.dimensionName}` : INTRINSIC_VALUE_EXPRESSION,
      _localValues: param.type === 'enum' ? param.values : undefined,
      source,
      defaultValue,
    };
    return normalized;
  });
}

/**
 * @param columnFunctions - raw column functions
 * @param source - data source name
 */
export function normalizeColumnFunctions(
  columnFunctions: RawColumnFunction[],
  source: string
): ColumnFunctionMetadataPayload[] {
  return columnFunctions.map((func) => {
    const { id, name, description, arguments: args } = func;
    const normalizedFunc: ColumnFunctionMetadataPayload = {
      id,
      name,
      description,
      source,
    };
    if (args) {
      normalizedFunc._parametersPayload = constructFunctionParameters(args, source);
    }
    return normalizedFunc;
  });
}

export default class MetricFunctionSerializer extends EmberObject {
  /**
   * @param payload - raw metric function with envelope
   * @param source - data source name
   */
  normalize(payload: RawMetricFunctionPayload, source: string): ColumnFunctionMetadataPayload[] | undefined {
    if (payload?.['metric-functions']?.rows) {
      return normalizeColumnFunctions(payload['metric-functions'].rows, source);
    } else {
      return undefined;
    }
  }
}
