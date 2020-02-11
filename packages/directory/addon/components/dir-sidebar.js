/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * <DirSidebar />
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-sidebar';
import { inject as service } from '@ember/service';
import { oneWay } from '@ember/object/computed';
import { computed } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class DirSidebar extends Component {
  /**
   * @property {Service} directoriesService - service for loading valid directory choices
   */
  @service('directories')
  directoriesService;

  /**
   * @property {Array} directories
   */
  @computed
  get directories() {
    return this.directoriesService.getDirectories();
  }

  /**
   * @property {Object} selectedDirectory
   */
  @oneWay('directories.0')
  selectedDirectory;

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
}

export default DirSidebar;
