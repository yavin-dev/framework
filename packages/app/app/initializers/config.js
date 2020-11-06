/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import config from 'navi-app/config/environment';
import { mergeWith } from 'lodash-es';

export function initialize() {
  // Navi specific configuration
  mergeWith(config.navi, window.NAVI_APP, (a, b) => {
    Array.isArray(a) ? [...a, ...b] : undefined;
  });
}

export default {
  name: 'config',
  initialize
};
