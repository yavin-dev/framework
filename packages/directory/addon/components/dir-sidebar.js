/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{dir-sidebar}}
 */
import Component from '@ember/component';
import layout from '../templates/components/dir-sidebar';
import Directories from '../utils/enums/directories';
import { oneWay } from '@ember/object/computed';

export default Component.extend({
  layout,

  classNames: [ 'dir-sidebar' ],

  /**
   * @property {Array} directories
   */
  directories: Directories,

  /**
   * @property {Object} selectedDirectory
   */
  selectedDirectory: oneWay('directories.0'),

  /**
   * @property {Object} selectedFilter
   */
  selectedFilter: oneWay('selectedDirectory.filters.0')
});
