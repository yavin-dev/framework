/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: A model that holds an array of dimension values.
 */

import ArrayProxy from '@ember/array/proxy';

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
    if (this.meta?.pagination) {
      const perPage = this.meta.pagination.rowsPerPage;
      const totalResults = this.meta.pagination.numberOfResults;
      const currPage = this.meta.pagination.currentPage;
      const totalPages = totalResults / perPage;
      if (currPage < totalPages) {
        const options = {
          page: currPage + 1,
          perPage: perPage
        };
        return this._dimensionsService.fetchAll(this.dimension, options);
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
    if (this.meta?.pagination) {
      if (this.meta.pagination.currentPage > 1) {
        const options = {
          page: this.meta.pagination.currentPage - 1,
          perPage: this.meta.pagination.rowsPerPage
        };
        return this._dimensionsService.fetchAll(this.dimension, options);
      }
    }
    return null;
  }
});
