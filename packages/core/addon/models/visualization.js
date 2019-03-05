/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { set, get } from '@ember/object';

import DS from 'ember-data';
import Fragment from 'ember-data-model-fragments/fragment';

export default Fragment.extend({
  type: DS.attr('string'),
  version: DS.attr('number'),
  metadata: DS.attr(),

  /**
   * @property {Object} - temporary request object used for validation
   */
  _request: undefined,

  /**
   * Test if the config is valid for the given request
   *
   * @method isValidForRequest
   * @param {Object} request - request object
   * @return {Boolean} - is the config valid
   */
  isValidForRequest(request) {
    set(this, '_request', request);
    this.validateSync();

    return get(this, 'validations.isValid');
  },

  /**
   * Rebuild config based on request and response
   *
   * @method rebuildConfig
   * @param {MF.Fragment} request - request model fragment
   * @param {Object} response - response object
   * @return {Object} this object
   */
  rebuildConfig(/*request, response*/) {
    /*
     * TODO: Enable this after figuring out the reason for ember-cp-validations failing
     * Ember.assert(`rebuildConfig is not implemented in ${this.constructor.modelName}`);
     */
  }
});
