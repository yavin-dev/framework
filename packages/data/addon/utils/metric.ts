/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import FunctionParameterMetadataModel, { DataType } from '@yavin/client/models/metadata/function-parameter';
import { isPresent } from '@ember/utils';
import type { ParameterValue } from '@yavin/client/request';

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
