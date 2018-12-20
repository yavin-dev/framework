/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{#table-iterator
 *   useVerticalCollection=false
 *   tableData=tableData
 *   rowDimensions=rowDimensions
 *   estimateHeight=estimateHeight
 *   bufferSize=bufferSize
 *   occlusion=true
 *   containerSelector=containerSelector
 *   as |row idx|
 * }}
 * {{table-iterator}}
 */
import Component from '@ember/component';
import layout from '../templates/components/table-iterator';
import { get, computed } from '@ember/object';

export default Component.extend({
  layout,

  tagName: '',

  /**
   * @property {Boolean} occlusion - whether or not to incremental render
   */
  occlusion: false,

  /**
   * @property {String} collectionRenderer - chooses which collection renderer to use
   */
  collectionRenderer: computed('useVerticalCollection', function() {
    return get(this, 'useVerticalCollection') ? 'vertical-collection' : 'ember-collection';
  })
});
