/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{#table-iterator
 *   tableData=tableData
 *   rowDimensions=rowDimensions
 *   occlusion=true
 *   as |row idx|
 * }}
 * {{table-iterator}}
 */
import Component from '@ember/component';
import layout from '../templates/components/table-iterator';

export default Component.extend({
  layout,

  tagName: '',

  /**
   * @property {Boolean} occlusion - whether or not to incremental render
   */
  occlusion: false,
});
