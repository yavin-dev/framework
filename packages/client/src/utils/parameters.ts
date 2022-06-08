/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { DataType } from '../models/metadata/function-parameter.js';
import type FunctionParameterMetadataModel from '../models/metadata/function-parameter.js';
import type { ParameterValue } from '../request.js';

export function parseParameterValue(
  parameter: FunctionParameterMetadataModel,
  rawParamValue: ParameterValue
): ParameterValue {
  const { defaultValue, valueType } = parameter;
  let paramValue: ParameterValue = rawParamValue ? rawParamValue : defaultValue ?? '';
  if ([DataType.INTEGER, DataType.DECIMAL].includes(valueType)) {
    paramValue = Number(rawParamValue);
  } else if (DataType.BOOLEAN === valueType) {
    paramValue = Boolean(rawParamValue);
  }
  return paramValue;
}
