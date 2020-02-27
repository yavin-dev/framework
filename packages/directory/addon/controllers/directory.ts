/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { computed, action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import DirectoriesService from 'navi-directory/services/directories';
import RouterService from '@ember/routing/router-service';

export default class DirectoryController extends Controller {
  /**
   * @property {Service} directories - service to load the valid directory options
   */
  @service directories!: DirectoriesService;

  /**
   * @property {Service} router - service to check current route
   */
  @service router!: RouterService;

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
   * @property {String} sortDir - query param for sort direction
   */
  sortDir = 'desc';

  /**
   * @property {String} q - query param for the search query
   */
  q = '';

  /**
   * @property {String} sortKey - sort key (computed by sortBy query param)
   */
  get sortKey() {
    const { sortBy } = this;
    return sortBy === 'author' ? 'author.id' : sortBy;
  }

  /**
   * @property {String} title - Title for the table
   */
  @computed('filter', 'router.currentRouteName')
  get title() {
    const { router, directories, filter } = this;
    const currentDir = directories.getDirectories().find(dir => dir.routeLink === router.currentRouteName);

    let title = currentDir?.name,
      queryParams = { filter },
      match = currentDir?.filters.filter(filter => JSON.stringify(filter.queryParams) === JSON.stringify(queryParams));

    if (match?.length === 1) {
      title = match[0].name;
    }

    return title;
  }

  /**
   * @action searchFor
   * Sets the query param for search
   * @param {string} query
   */
  @action
  searchFor(query: string) {
    set(this, 'q', query);
  }

  /**
   * @action updateQueryParams - update to the new query params
   * @param {object} queryParams
   */
  @action
  updateQueryParams(queryParams: object) {
    this.transitionToRoute({ queryParams });
  }
}

declare module '@ember/controller' {
  interface Registry {
    directory: DirectoryController;
  }
}
