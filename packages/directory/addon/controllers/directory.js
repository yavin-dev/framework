/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';

export default Controller.extend({
  /**
   * @property {Array} queryParams - array of allowed query params
   */
  queryParams: [ 'filter', 'type', 'sortBy' ],

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
   * allowed sortBy's - updatedOn
   */
  sortBy: 'updatedOn'
});
