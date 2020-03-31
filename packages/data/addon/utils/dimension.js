/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { upperFirst } from 'lodash-es';

/**
 * Returns canonicalized name of a dimension
 * @function canonicalizeDimension
 * @param {Object} dimension - dimension
 * @param {String} dimension.id - dimension name
 * @param {String} dimension.field - field name
 */
export function canonicalizeDimension({ id, field }) {
  if (field) {
    return `${id}(${field})`;
  }

  return id;
}

/**
 * Formats a dimension given name and field
 * @function formatDimensionName
 * @param {Object} dimension - dimension
 * @param {String} dimension.name - dimension name
 * @param {String} dimension.field - field name
 */
export function formatDimensionName({ name, field }) {
  let upperName = upperFirst(name);

  if (field) {
    return `${upperName} (${field})`;
  }

  return upperName;
}
