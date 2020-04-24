/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <EditableLabel
 *      @value={{this.value}}
 *      @onChange={{this.onChange}}
 *   />
 */

import Component from '@ember/component';
import { computed, set, action } from '@ember/object';
import { oneWay } from '@ember/object/computed';
import { debounce, next } from '@ember/runloop';
import layout from '../templates/components/editable-label';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@tagName('')
@templateLayout(layout)
class EditableLabelComponent extends Component {
  /**
   * @property {Boolean} isEditingValue
   */
  isEditingValue = false;

  /**
   * @property {String} _localValue
   */
  @oneWay('value') _localValue;

  /**
   * @property {Number} inputSize - length of the value with a max length of 50
   */
  @computed('_localValue')
  get _inputSize() {
    return Math.min(this._localValue.length, 49) + 1;
  }

  @action
  setupInputElement(element) {
    this.inputElement = element;
  }

  /**
   * Switch to view mode and send update
   * @action editComplete
   * @param {String} value - updated input value
   */
  @action
  editComplete(value) {
    set(this, 'isEditingValue', false);
    if (this.value !== value) {
      debounce(this, this.onChange, value, 10);
    }
  }

  /**
   * Keep the input in sync with the latest value changes
   * @action resetValue
   */
  @action
  resetValue() {
    set(this, '_localValue', this.value);
  }

  /**
   * Selects label text
   * @action highlightLabelInput
   */
  @action
  highlightLabelInput() {
    next(() => this.inputElement.focus());
  }

  /**
   * Removes focus from label input
   * @action blurLabelInput
   */
  @action
  blurLabelInput() {
    this.inputElement.blur();
  }
}

export default EditableLabelComponent;
