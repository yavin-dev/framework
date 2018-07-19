/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Returns serialized version of a model
 * usage: (serialize model)
 */
import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';

/**
 * Serializes model if it can be
 * @param params {object} - object that has a serialize signature;
 * @returns {*} - serialized object
 */
export function serialize([model] /*, hash*/) {
  if (model === null || model === undefined) {
    return model;
  }
  if (
    typeof model === 'object' &&
    'serialize' in model &&
    typeof model.serialize === 'function'
  ) {
    return model.serialize();
  }
  assert('Cannot serialize ' + typeof model);
}

export default helper(serialize);
