/**
 * Copyright 2017, Yahoo Holdings Inc.
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
   * @property {Service} _factsService - instance of the bard-facts service passed in on create
   */
  _factService: undefined,

  /**
   * @method next - Returns the `next` url from the meta block of the response
   * @returns {Promise|null} - Promise with the bard response model object for next page
   *                      or null when trying to go past last page
   */
  next() {
    return this._factService.fetchNext(this.response, this.request);
  },

  /**
   * @method previous - Returns the `previous` url from the meta block of the response
   * @returns {Promise|null} - Promise with the bard response model object for previous page
   *                      or null when trying to access pages less than the first page
   */
  previous() {
    return this._factService.fetchPrevious(this.response, this.request);
  }
});
