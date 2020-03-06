/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { getProperties, get, set, computed, action } from '@ember/object';
import { inject as service } from '@ember/service';
import { A as arr } from '@ember/array';

export default class DirectoryController extends Controller {
  /**
   * @property {Service} directories - service to load the valid directory options
   */
  @service directories;

  /**
   * @property {Service} router - service to check current route
   */
  @service router;

  /**
   * @property {Array} queryParams - array of allowed query params
   */
  queryParams = ['filter', 'type', 'sortBy', 'sortDir', 'q'];

  /**
   * @property {String} filter - query param for filter
   * allowed filters - favorites
   */
  filter = null;

  /**
   * @property {String} type - query param for type
   * allowed types - reports, dashboards
   */
  type = null;

  /**
   * @property {String} sortBy - query param for sortBy
   */
  sortBy = 'updatedOn';

  /**
   * @property {String} sortKey - sort key (computed by sortBy query param)
   */
  get sortKey() {
    const { sortBy } = this;
    return sortBy === 'author' ? 'author.id' : sortBy;
  }

  /**
   * @property {String} sortDir - query param for sort direction
   */
  sortDir = 'desc';

  /**
   * @property {String} q - query param for the search query
   */
  q = '';

  /**
   * @property {String} title - Title for the table
   */
  @computed('filter', 'router.currentRouteName')
  get title() {
    const currentRoute = get(this, 'router.currentRouteName'),
      dirInfo = this.directories.getDirectories(),
      currentDir = arr(dirInfo).findBy('routeLink', currentRoute);

    let title = currentDir.name,
      queryParams = getProperties(this, ['filter']),
      match = currentDir.filters.filter(filter => JSON.stringify(filter.queryParam) === JSON.stringify(queryParams));

    if (match.length === 1) {
      title = match[0].name;
    }

    return title;
  }

  /**
   * @action searchFor
   * Sets the query param for search
   * @param {String} query
   */
  @action
  searchFor(query) {
    set(this, 'q', query);
  }

  /**
   * @action updateQueryParams - update to the new query params
   * @param {Object} queryParams
   */
  @action
  updateQueryParams(queryParams) {
    this.transitionToRoute({ queryParams });
  }
}
