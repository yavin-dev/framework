/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{navi-tag-input/tag
 *       tag=tag
 *       index=index
 *       isRemovable=true
 *       onRemoveTag=(action 'removeTag')
 *   }}
 */
import Component from '@ember/component';
import layout from '../../templates/components/navi-tag-input/tag';

export default Component.extend({
  layout,

  /**
   * @property {String} tagName
   */
  tagName: 'li'
});
