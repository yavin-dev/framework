/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { RawColumnFunctionArguments } from './metadata.js';
import { DataType } from '../../../models/metadata/function-parameter.js';
import { ValueSourceType } from '../../../models/metadata/elide/dimension.js';
import type { FunctionParameterMetadataPayload } from '../../../models/metadata/function-parameter.js';

const paramValueSourceTypeMap: Record<string, ValueSourceType> = {
  enum: ValueSourceType.ENUM,
  dimension: ValueSourceType.TABLE,
  none: ValueSourceType.NONE,
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
      valueType: DataType.TEXT, //bard does not provide a value type
      valueSourceType: paramValueSourceTypeMap[param.type],
      tableSource: param.type === 'dimension' ? { valueSource: param.dimensionName } : undefined,
      _localValues: param.type === 'enum' ? param.values : undefined,
      source,
      defaultValue,
    };
    return normalized;
  });
}
