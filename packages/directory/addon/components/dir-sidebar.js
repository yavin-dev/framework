/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-sidebar}}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-sidebar';
import { inject as service } from '@ember/service';
import { oneWay } from '@ember/object/computed';
import { computed, get } from '@ember/object';

export default Component.extend({
  layout,

  classNames: ['dir-sidebar'],

  /**
   * @property {Service} directoriesService - service for loading valid directory choices
   */
  directoriesService: service('directories'),

  /**
   * @property {Array} directories
   */
  directories: computed(function() {
    return get(this, 'directoriesService').getDirectories();
  }),

  /**
   * @property {Object} selectedDirectory
   */
  selectedDirectory: oneWay('directories.0'),

  /**
   * @property {Array} filters
   */
  filters: computed(function() {
    return [
      {
        name: 'Favorites',
        icon: 'star-o',
        queryParams: { filter: 'favorites' }
      }
    ];
  })
});
