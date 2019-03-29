/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { camelize } from '@ember/string';
import { computed, getWithDefault, get } from '@ember/object';
import DS from 'ember-data';
import config from 'ember-get-config';
import { pluralize } from 'ember-inflector';

export default DS.JSONAPIAdapter.extend({
  /**
   * @property {String} host - persistence WS host
   */
  host: computed(function() {
    return getWithDefault(config, 'navi.appPersistence.uri', '');
  }),

  /**
   * @property {Boolean} - coalesceFindRequests - optimize requests for fetching multiple records at once
   */
  coalesceFindRequests: true,

  /**
   * Get ajax options
   *
   * @override
   * @method ajaxOptions
   * @return {Object} - options hash
   */
  ajaxOptions() {
    let hash = this._super(...arguments);

    hash.xhrFields = { withCredentials: true };

    hash.crossDomain = true;

    hash.timeout = config.navi.appPersistence.timeout;

    return hash;
  },

  /**
   * @override
   * @method findMany
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {Array} ids
   * @param {Array} snapshots
   * @return {Promise} promise
   */
  findMany(store, type, ids, snapshots) {
    // Match our API's format for filters since it differs from Ember Data default
    let url = this.buildURL(type.modelName, ids, snapshots, 'findMany'),
      filterRoot = pluralize(type.modelName),
      filterId = `${filterRoot}.id`;

    return this.ajax(url, 'GET', {
      data: { filter: { [filterId]: ids.join(',') } }
    });
  },

  /**
   * @method normalizeErrorResponse
   * @override
   * @private
   * @param  {Number} status - status code
   * @param  {Object} headers - response headers
   * @param  {Object} payload - response payload
   * @return {Object} errors payload
   */
  normalizeErrorResponse(status, headers, payload) {
    let detail = get(payload, 'errors');
    return [
      {
        status: `${status}`,
        title: 'The backend responded with an error',
        detail
      }
    ];
  },

  /**
   * Formats type for url
   *
   * @override
   * @method pathForType
   * @param {String} type - name of type
   * @returns {String} transformed name for type
   */
  pathForType(type) {
    return pluralize(camelize(type));
  }
});
