/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Ember service that can fetch metric parameters
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { assert } from '@ember/debug';

export default Service.extend({
  /**
   * @private
   * @property {Ember.Service} dimensionService
   */
  _dimensionService: service('bard-dimensions'),

  /**
   * @method fetchAllValues
   * fetches all values of type dimension for the metric parameter
   *
   * @param {Object} parameter - metric parameter objects
   * @returns {Promise} response with dimension values
   */
  fetchAllValues({ type, dimensionName }) {
    assert(
      `Fetching values of type: '${type}' is not supported`,
      type === 'dimension'
    );

    return get(this, '_dimensionService').all(dimensionName);
  }
});
