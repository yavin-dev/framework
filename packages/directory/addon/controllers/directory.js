/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { set } from '@ember/object';


export default Controller.extend({
  /**
   * @property {Array} queryParams - array of allowed query params
   */
  queryParams: [ 'filter', 'type', 'sortBy', 'q' ],

  /**
   * @property {String} filter - query param for filter
   * allowed filters - favorites, recentlyUpdated
   */
  filter: null,

  /**
   * @property {String} type - query param for type
   * allowed types - reports, dashboards
   */
  type: null,

  /**
   * @property {String} sortBy - query param for sortBy
   */
  sortBy: 'title',

  /**
   * @property {String} q - query param for the search query
   */
  q: '',

  actions: {
    /**
     * @action searchFor
     * Sets the query param for search
     * @param {String} query 
     */
    searchFor(query) {
      set(this, 'q', query);
    }
  }
});
