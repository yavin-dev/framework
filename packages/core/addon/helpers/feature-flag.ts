/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { helper as buildHelper } from '@ember/component/helper';
import config from 'ember-get-config';

/**
 * @param flag name of feature flag
 * @returns status of feature flag
 */
export function featureFlag(flag: string): boolean {
  return config.navi.FEATURES[flag] || false;
}

export default buildHelper((args: Parameters<typeof featureFlag>) => featureFlag(...args));
