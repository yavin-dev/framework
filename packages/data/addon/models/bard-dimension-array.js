/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds an array of dimension values.
 */

import ArrayProxy from '@ember/array/proxy';
import { get } from '@ember/object';

export default ArrayProxy.extend({
  /**
   * @property {Object} dimension - the dimension object
   */
  dimension: undefined,

  /**
   * @property {Object} meta - meta response for dimension
   */
  meta: undefined,

  /**
   * @property {Service} _dimensionsService - instance of the bard-dimensions service passed in on create
   */
  _dimensionsService: undefined,

  /**
   * @method next - Returns the `next` url from the meta block of the response
   * @returns {Promise|null} - Promise with the bard dimension model object for next page
   *                      or null when trying to go past last page
   */
  next() {
    if (get(this, 'meta.pagination')) {
      let perPage = get(this, 'meta.pagination.rowsPerPage'),
        totalResults = get(this, 'meta.pagination.numberOfResults'),
        currPage = get(this, 'meta.pagination.currentPage'),
        totalPages = totalResults / perPage;
      if (currPage < totalPages) {
        let dimension = get(this, 'dimension'),
          options = {
            page: currPage + 1,
            perPage: perPage
          };
        return get(this, '_dimensionsService').fetchAll(dimension, options);
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
    if (get(this, 'meta.pagination')) {
      if (get(this, 'meta.pagination.currentPage') > 1) {
        let dimension = get(this, 'dimension'),
          options = {
            page: get(this, 'meta.pagination.currentPage') - 1,
            perPage: get(this, 'meta.pagination.rowsPerPage')
          };
        return get(this, '_dimensionsService').fetchAll(dimension, options);
      }
    }
    return null;
  }
});
