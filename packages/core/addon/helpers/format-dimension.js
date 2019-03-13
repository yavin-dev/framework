/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Util for formatting an dimension object as a user readable string
 */
import Helper from '@ember/component/helper';
import { get } from '@ember/object';

/**
 * @param {Object} dimension - a dimension object
 * @returns {String} string in one of the following forms:
 *                  'description (id)'
 *                  'id' if no description
 *                  '' empty string if dimension is undefined
 */
export function formatDimension([dimension]) {
  if (!dimension) {
    return '';
  }

  let desc = get(dimension, 'description'),
    id = get(dimension, 'id');

  if (!id && !desc) {
    return '';
  }

  return desc ? `${desc} (${id})` : id;
}

export default Helper.extend({ compute: formatDimension });
