/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can fetch metric parameters
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import { resolve } from 'rsvp';

export default Service.extend({
  init() {
    this._super(...arguments);
    /**
     * @property {Object} _supportedHandlers List of parametery types supported.
     */
    this._supportedHandlers = {
      dimension: this._dimension.bind(this),
      enum: this._enum.bind(this)
    };
  },

  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  _dimensionService: service('bard-dimensions'),

  /**
   * @returns {Array} list of parameter types this service supports
   */
  supportedTypes() {
    return Object.keys(this._supportedHandlers);
  },

  /**
   * @method fetchAllValues
   * fetches all values of type dimension for the metric parameter
   *
   * @param {Object} parameter - metric parameter objects
   * @returns {Promise} response with dimension values
   */
  fetchAllValues(meta) {
    assert(`Fetching values of type: '${meta.type}' is not supported`, this.supportedTypes().includes(meta.type));

    return this._supportedHandlers[meta.type](meta);
  },

  /**
   * @private
   * Fetches dimension values from service
   * @param {Object} meta - parameterized metric metadata
   * @returns {Promise} response with dimension values
   */
  _dimension({ dimensionName }) {
    return get(this, '_dimensionService').all(dimensionName);
  },

  /**
   * @private
   * Fetches dimension values from meta for enum type
   * @param {Object} meta - parameterized metric metadata
   * @returns {Promise} response with dimension values
   */
  _enum(meta) {
    return resolve(meta.values);
  }
});
