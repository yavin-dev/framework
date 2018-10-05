/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds the response from a Bard query.
 */

import EmberObject, { get } from '@ember/object';

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
    if (get(this, 'response.meta.pagination')) {
      let perPage = get(this, 'response.meta.pagination.rowsPerPage'),
        totalResults = get(this, 'response.meta.pagination.numberOfResults'),
        currPage = get(this, 'response.meta.pagination.currentPage'),
        totalPages = totalResults / perPage;
      if (currPage < totalPages) {
        let request = get(this, 'request'),
          options = {
            page: currPage + 1,
            perPage: perPage
          };
        return get(this, '_factsService').fetch(request, options);
      }
    }
    return null;
  },

  /**
   * @method previous - Returns the `previous` url from the meta block of the response
   * @returns {Promise|null} - Promise with the bard response model object for previous page
   *                      or null when trying to access pages less than the first page
   */
  previous() {
    if (get(this, 'response.meta.pagination')) {
      if (get(this, 'response.meta.pagination.currentPage') > 1) {
        let request = get(this, 'request'),
          options = {
            page: get(this, 'response.meta.pagination.currentPage') - 1,
            perPage: get(this, 'response.meta.pagination.rowsPerPage')
          };
        return get(this, '_factsService').fetch(request, options);
      }
    }
    return null;
  }
});
