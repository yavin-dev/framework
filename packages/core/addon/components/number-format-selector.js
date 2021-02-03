/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{number-format-selector
 *    format=format
 *    onUpdateFormat = (action 'onUpdateFormat')
 *  }}
 */

import { get, computed } from '@ember/object';
import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../templates/components/number-format-selector';
import NumberFormats from 'navi-core/utils/enums/number-formats';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class NumberFormatSelectorComponent extends Component {
  /**
   * @property {Array} predefinedFormats
   * list of format types shown to the user
   */
  predefinedFormats = NumberFormats;

  /**
   * @property {String} customFormat
   * returns empty string if the current format
   * is one of the predefined formats
   */
  @computed('format')
  get customFormat() {
    let predefinedFormats = A(get(this, 'predefinedFormats')),
      currentFormat = get(this, 'format'),
      match = predefinedFormats.findBy('format', currentFormat);
    return match ? '' : currentFormat;
  }

  /**
   * @property {Boolean} isCustomFormat
   * returns empty string if the current format
   * is one of the predefined formats
   */
  @computed('format')
  get isCustomFormat() {
    let predefinedFormats = A(get(this, 'predefinedFormats')),
      currentFormat = get(this, 'format'),
      match = predefinedFormats.findBy('format', currentFormat);

    if (match === undefined) {
      return true;
    } else if (match.format === '') {
      return true;
    } else {
      return false;
    }
  }
}

export default NumberFormatSelectorComponent;
