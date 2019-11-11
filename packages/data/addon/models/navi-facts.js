/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds the response from a Bard query.
 */

import EmberObject from '@ember/object';

export default EmberObject.extend({
  /**
   * @property {Object} request - the request object
   */
  request: undefined,

  /**
   * @property {Object} response - response for request
   */
  response: undefined,

  /**
   * @property {Service} _factsService - instance of the facts service passed in on create
   */
  _factService: undefined,

  /**
   * @method next 
   * @returns {Promise|null} - Promise with the response model object for next page
   *                      or null when trying to go past last page
   */
  next() {
    return this._factService.fetchNext(this.response, this.request);
  },

  /**
   * @method previous 
   * @returns {Promise|null} - Promise with the response model object for previous page
   *                      or null when trying to access pages less than the first page
   */
  previous() {
    return this._factService.fetchPrevious(this.response, this.request);
  }
});
