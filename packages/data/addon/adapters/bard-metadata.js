/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';

import EmberObject from '@ember/object';
import config from 'ember-get-config';
import { pluralize } from 'ember-inflector';

const FACT_HOST = config.navi.dataSources[0].uri;

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
   * @return {String} URL Path
   */
  _buildURLPath(type, id) {
    let host = FACT_HOST,
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
    let url = this._buildURLPath(type, id),
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
