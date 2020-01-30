/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 * Usage:
 *  {{#tag-input
 *    tags=tags
 *    addTag=(action 'addTag')
 *    removeTagAtIndex=(action 'removeTagAtIndex')
 *    tagComponent='my-custom-tag-component'
 *    splitOnPaste=false
 *    as |tag|
 *  }}
 *    {{tag}}
 *  {{/tag-input}}
 */

import layout from '../templates/components/navi-tag-input';
import TagInput from 'ember-tag-input/components/tag-input';

const COMMA_KEY_CODE = 188;

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
   * @property {Boolean} splitOnPaste - whether or not to listen for paste input and handle importing lists
   */
  splitOnPaste: false,

  /**
   * Ignore comma so that only 'enter' key adds new tags
   *
   * @param {InputEvent} e - The keydown input event
   * @override https://github.com/calvinlough/ember-tag-input/blob/v1.2.2/addon/components/tag-input.js#L74-L106
   */
  _onInputKeyDown(e) {
    if (e.which === COMMA_KEY_CODE) {
      return;
    }

    return this._super(...arguments);
  },

  /**
   * Allow simple imports of pasted lists
   * @param {InputEvent} e - The paste event
   */
  _onInputPaste(e) {
    const pastedText = e.clipboardData.getData('text/plain').trim();
    if (this.splitOnPaste !== true || !pastedText.includes(',')) {
      return;
    }

    e.preventDefault();
    this.set('_showBulkImport', true);
    this.set('_bulkImportValue', pastedText);
  },

  /**
   * Add a listener for paste events
   * @override https://github.com/calvinlough/ember-tag-input/blob/v1.2.2/addon/components/tag-input.js#L123-L136
   */
  initEvents() {
    this._super(...arguments);

    const onInputPaste = this._onInputPaste.bind(this);
    const newTagInput = this.element.querySelector('.emberTagInput-input');
    newTagInput.addEventListener('paste', onInputPaste);
  },

  /**
   * Remove listener for paste events
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);

    const onInputPaste = this._onInputPaste.bind(this);
    const newTagInput = this.element.querySelector('.emberTagInput-input');
    newTagInput.removeEventListener('paste', onInputPaste);
  },

  actions: {
    /**
     * @action closeModal - Closes the modal and clears the pasted value
     */
    closeModal() {
      this.set('_showBulkImport', false);
      this.set('_bulkImportValue', undefined);
    },

    /**
     * @action addTags - Imports new tags and only adds unique ones
     * @param {Array<String>} tags - The tags to be imported
     */
    addTags(tags) {
      return tags.forEach(tag => this.addNewTag(tag));
    }
  }
});
