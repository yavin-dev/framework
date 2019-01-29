/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import upperFirst from 'lodash/upperFirst';

/**
 * Returns canonicalized name of a dimension
 * @function canonicalizeDimension
 * @param {String} dimension.dimension - dimension name
 * @param {String} dimension.field - field name
 */
export function canonicalizeDimension({ dimension, field }) {
  if (field) {
    return `${dimension}(${field})`;
  }

  return dimension;
}

/**
 * Formats a dimension given name and field
 * @function formatDimensionName
 * @param {String} dimension.dimension - dimension name
 * @param {String} dimension.field - field name
 */
export function formatDimensionName({ dimension, field }) {
  let name = upperFirst(dimension);

  if (field) {
    return `${name} (${field})`;
  }

  return name;
}
