/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSidebar />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DirSidebarComponent extends Component {
  /**
   * @constructor
   */
  constructor() {
    super(...arguments);
    this.selectedDirectory = this.args.selectedDirectory;
  }

  /**
   * @property {Service} directoriesService - service for loading valid directory choices
   */
  @service('directories')
  directoriesService;

  /**
   * @property {Array} directories
   */
  get directories() {
    return this.directoriesService.getDirectories();
  }

  /**
   * @property {Object} selectedDirectory
   */
  @tracked selectedDirectory;

  /**
   * @property {Object} selectedFilter
   */
  @tracked selectedFilter;

  /**
   * @property {Array} filters
   */
  filters = [
    {
      name: 'Favorites',
      icon: 'star-o',
      queryParams: { filter: 'favorites' }
    }
  ];

  @action
  setSelectedDirectory(directory) {
    this.selectedDirectory = directory;
  }

  @action
  setSelectedFilter(filter) {
    this.selectedFilter = filter;
  }
}
