/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to discover all the available search providers.
 */

import Service from '@ember/service';
import config from 'ember-get-config';

/* global requirejs */

export default class NaviSearchResultService extends Service {
  /**
   * @method all
   * @returns {Array} array of available search providers
   */
  all() {
    const resultComponentRegex = new RegExp(`^(?:${config.modulePrefix}/)?components/navi-search-result/([a-z-]*)$`),
      auxResultComponentRegex = new RegExp(`^(?:${config.modulePrefix}/)?components/([a-z-/]*)$`),
      resultComponents = Object.keys(requirejs.entries).filter(requirejsFileName =>
        resultComponentRegex.test(requirejsFileName)
      );
    return resultComponents.map(componentFileName => auxResultComponentRegex.exec(componentFileName)[1]);
  }
}
