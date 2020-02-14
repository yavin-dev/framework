/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  <NumberFormatDropdown
 *    @column={{@column}}
 *    @onUpdateFormat{{action @onUpdateFormat}}
 *  />
 */

import Component from '@ember/component';
import layout from '../templates/components/number-format-dropdown';
import { oneWay } from '@ember/object/computed';
import { get, set, getWithDefault, action } from '@ember/object';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { merge } from 'lodash-es';

@templateLayout(layout)
@tagName('')
class NumberFormatDropdownComponent extends Component {
  /**
   * @property {String} format
   */
  @oneWay('column.attributes.format') format;

  /**
   * @action updateColumnNumberFormat
   */
  @action
  updateColumnNumberFormat() {
    const { onUpdateReport, column } = this;
    const format = getWithDefault(this, 'format', get(column, 'attributes.format'));
    const updatedColumn = merge({}, column, { attributes: { format } });

    onUpdateReport('updateColumn', updatedColumn);
  }

  /**
   *
   * @param {String} format - The new format for the number
   */
  @action
  setFormat(format) {
    set(this, 'format', format);
  }
}

export default NumberFormatDropdownComponent;
