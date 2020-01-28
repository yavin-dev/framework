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
  tagComponent: 'navi-tag-input/tag',

  /**
   * Ignore comma so that only 'enter' key adds new tags
   *
   * @param {InputEvent} e - The keydown input event
   * @override https://github.com/calvinlough/ember-tag-input/blob/v1.2.2/addon/components/tag-input.js#L74-L106
   */
  _onInputKeyDown(e) {
    if (e.which === 118 || e.target.value === '') {
      // comma input
      return;
    }

    return this._super(...arguments);
  }
});
