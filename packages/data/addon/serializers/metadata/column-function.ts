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
  FunctionArgumentMetadataPayload,
  INTRINSIC_VALUE_EXPRESSION
} from 'navi-data/models/metadata/function-argument';

type RawMetricFunctionPayload = {
  'metric-functions': {
    rows: RawColumnFunction[];
  };
};

/**
 * @param parameters - raw column function parameters
 * @param source - data source name
 */
export function constructFunctionArguments(
  parameters: RawColumnFunctionArguments,
  source: string
): FunctionArgumentMetadataPayload[] {
  return Object.keys(parameters).map(param => {
    const { type, defaultValue, values, dimensionName, description } = parameters[param];

    const normalized: FunctionArgumentMetadataPayload = {
      id: param,
      name: param,
      description,
      valueType: 'TEXT',
      type: 'ref', // It will always be ref for our case because all our parameters have their valid values defined in a dimension or enum
      expression: type === 'dimension' ? `dimension:${dimensionName}` : INTRINSIC_VALUE_EXPRESSION,
      _localValues: values,
      source,
      defaultValue
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
  return columnFunctions.map(func => {
    const { id, name, description, arguments: args } = func;
    const normalizedFunc: ColumnFunctionMetadataPayload = {
      id,
      name,
      description,
      source
    };
    if (args) {
      normalizedFunc.arguments = constructFunctionArguments(args, source);
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
