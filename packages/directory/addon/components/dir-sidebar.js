/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-sidebar}}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-sidebar';
import Directories from '../utils/enums/directories';
import { oneWay } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Component.extend({
  layout,

  classNames: ['dir-sidebar'],

  /**
   * @property {Array} directories
   */
  directories: Directories,

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
