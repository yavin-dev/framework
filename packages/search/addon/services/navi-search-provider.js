/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to discover all the available search providers.
 */

import Service from '@ember/service';
import { getOwner } from '@ember/application';
import config from 'ember-get-config';
import { restartableTask } from 'ember-concurrency-decorators';

/* global requirejs */

export default class NaviSearchProviderService extends Service {
  /**
   * @method getProvider
   * @param name
   * @returns {Object} search provider service object
   */
  getProvider(name) {
    return getOwner(this).lookup(`service:navi-search/${name}`);
  }

  /**
   * @method all – Discovers all the search provider services
   * under the folder services/navi-search/
   * @private
   * @returns {Array} array of available search provider services
   */
  _all() {
    const searchProvidersRegex = new RegExp(`^(?:${config.modulePrefix}/)?services/navi-search/([a-z-]*)$`),
      searchProviderServices = Object.keys(requirejs.entries)
        .filter(requirejsFileName => searchProvidersRegex.test(requirejsFileName))
        .map(fileName => searchProvidersRegex.exec(fileName)[1]);
    return searchProviderServices.map(providerName => this.getProvider(providerName));
  }

  /**
   * @method search – Uses all the discovered search providers to fetch search results
   * @param {String} query
   * @returns {Array} array of objects that contain the search results,
   * the name of the result component as well as result ordering information
   */
  @restartableTask
  *search(query) {
    const searchProviders = this._all();
    let results = [];
    for (const provider of searchProviders) {
      const result = yield provider.search.perform(query);
      if (result.data.length) {
        results.push(result);
      }
    }
    return results;
  }
}
