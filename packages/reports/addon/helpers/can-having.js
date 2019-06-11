/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper } from '@ember/component/helper';

/**
 * Overridable helper that decides if a metric is allowed to have a filter on the base metric
 * filters may only be alllowed on parameterized versions for example and choosing a
 * valid default may not be appropriate.
 * @param {array} params
 * @return {Boolean}
 */
export function canHaving(/* params, hash */) {
  return true;
}

export default helper(canHaving);
