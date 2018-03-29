/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * Usage:
 *  {{#tag-input
 *    tags=tags
 *    addTag=(action 'addTag')
 *    removeTagAtIndex=(action 'removeTagAtIndex')
 *    tagComponent='my-custom-tag-component'
 *    as |tag|
 *  }}
 *    {{tag}}
 *  {{/tag-input}}
 */

import layout from '../templates/components/navi-tag-input';
import TagInput from 'ember-tag-input/components/tag-input';

export default TagInput.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['navi-tag-input'],

  /**
   * @property {String} tagComponent - optional name of custom component for rendering tags
   */
  tagComponent: 'navi-tag-input/tag'
});
