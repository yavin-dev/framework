/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base search provider service.
 */

import Service, { inject as service } from '@ember/service';

export default class NaviBaseSearchProviderService extends Service {
  /**
   * @property {Ember.Service} store
   */
  @service store;

  /**
   * @property {String} name
   */
  name = undefined;

  /**
   * @property {String} niceName
   */
  niceName = undefined;

  /**
   * @property {String} associatedComponent
   */
  associatedComponent = undefined;

  /**
   * @method search
   * @returns {Array} array of search results
   */
  search() {}
}
