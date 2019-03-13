/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import config from 'ember-get-config';

/**
 * @function featureFlag
 * @param {Array} single element with name of feature flag
 * @param {Boolean} value of feature flag
 */
export function featureFlag(flag) {
  return config.navi.FEATURES[flag] || false;
}

export default buildHelper(args => featureFlag(...args));
