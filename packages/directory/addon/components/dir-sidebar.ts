/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSidebar />
 */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import DirectoryService, { Directory } from '../services/directories';
import { DirectoryFilter } from '../services/directories';

interface DirSidebarComponentArgs {
  selectedDirectory: Directory;
}

export default class DirSidebarComponent extends Component<DirSidebarComponentArgs> {
  /**
   * @constructor - sets selectedDirectory to arg
   */
  constructor(owner: unknown, args: DirSidebarComponentArgs) {
    super(owner, args);
    this.selectedDirectory = args.selectedDirectory;
  }

  /**
   * @property {Service} directoriesService - service for loading valid directory choices
   */
  @service('directories') directoriesService!: DirectoryService;

  /**
   * @property {Array} directories
   */
  get directories() {
    return this.directoriesService.getDirectories();
  }

  /**
   * @property {Object} selectedDirectory
   */
  @tracked selectedDirectory?: Directory;

  /**
   * @property {Object} selectedFilter
   */
  @tracked selectedFilter?: DirectoryFilter;

  /**
   * @property {Array<DirectoryFilter>} filters
   */
  filters: Array<DirectoryFilter> = [
    {
      name: 'Favorites',
      icon: 'star-o',
      queryParams: { filter: 'favorites' }
    }
  ];
}
