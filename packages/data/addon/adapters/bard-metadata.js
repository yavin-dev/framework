/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { pluralize } from 'ember-inflector';
import { configHost } from '../utils/adapter';

export default EmberObject.extend({
  /**
   * @property namespace
   */
  namespace: 'v1',

  /**
   * @property {Service} ajax
   */
  ajax: service(),

  /**
   * Builds a URL path for a metadata query
   *
   * @method _buildURLPath
   * @private
   * @param {String} type
   * @param {String} id
   * @param {Object} options - optional host options.
   * @return {String} URL Path
   */
  _buildURLPath(type, id, options = {}) {
    const host = configHost(options),
      namespace = this.get('namespace');
    return `${host}/${namespace}/${pluralize(type)}/${id}`;
  },

  /**
   * Fetches all Bard metadata
   *
   * @method fetchAll
   * @public
   * @param {String} type
   * @param {Object} options
   * @return {Promise} metadata promise object
   */
  fetchAll(type, options) {
    return this.fetchMetadata(type, '', options);
  },

  /**
   * Fetches Bard metadata
   *
   * @method fetchMetadata
   * @public
   * @param {String} type
   * @param {String} id
   * @param {Object} options
   * @return {Promise} metadata promise object
   */
  fetchMetadata(type, id, options = {}) {
    let url = this._buildURLPath(type, id, options),
      query = options.query || {},
      clientId = options.clientId || 'UI',
      timeout = options.timeout || 300000;

    return this.get('ajax').request(url, {
      xhrFields: {
        withCredentials: true
      },
      beforeSend: function(xhr) {
        xhr.setRequestHeader('clientid', clientId);
      },
      crossDomain: true,
      data: query,
      timeout: timeout
    });
  }
});
