/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Parameters } from '../request';

interface ColumnLike {
  field: string;
  parameters?: Parameters;
}

/**
 * Checks whether a column has parameters
 * @param column
 */
export function hasParameters(column: ColumnLike): column is Required<ColumnLike> {
  const parameters = column.parameters || {};
  return Object.keys(parameters).length > 0;
}

/**
 * Returns a serialized list of parameters
 * @param params - a key: value object of parameters
 */
export function serializeParameters(params: Parameters = {}): string {
  const paramArray = Object.entries(params);
  paramArray.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  return paramArray
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
}

/**
 * Returns canonicalized name of a paramterized metric
 * @param column
 */
export function canonicalizeColumn(column: ColumnLike): string {
  return hasParameters(column) ? `${column.field}(${serializeParameters(column.parameters)})` : column.field;
}
