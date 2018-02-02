/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{editable-label
 *      value=value
 *      onChange=(action 'onChange')
 *   }}
 */

import Ember from 'ember';
import layout from '../templates/components/editable-label';

const { get, set, computed, run } = Ember;

export default Ember.Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['editable-label'],

  /**
   * @property {Boolean} isEditingValue
   */
  isEditingValue: false,

  /**
   * @property {String} _localValue
   */
  _localValue: Ember.computed.oneWay('value'),

  /**
   * @property {Number} inputSize - length of the value with a max length of 50
   */
  _inputSize: computed('_localValue', function() {
    let valueLength = get(this, '_localValue.length');
    return Math.min(valueLength, 49) + 1;
  }),

  actions: {
    /**
     * Switch to view mode and send update
     * @action editComplete
     * @param {String} value - updated input value
     */
    editComplete(value) {
      set(this, 'isEditingValue', false);
      if(get(this, 'value') !== value) {
        run.debounce(this.attrs, 'onChange', value, 10);
      }
    },

    /**
     * Keep the input in sync with the latest value changes
     * @action resetValue
     */
    resetValue() {
      set(this, '_localValue', get(this, 'value'));
    },

    /**
     * Selects label text
     * @action highlightLabelInput
     */
    highlightLabelInput() {
      Ember.run.next(() => {
        this.$('.editable-label__input').select();
      });
    },

    /**
     * Removes focus from label input
     * @action blurLabelInput
     */
    blurLabelInput() {
      this.$('.editable-label__input').blur();
    }
  }
});
