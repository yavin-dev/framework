/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *  {{number-format-dropdown
 *    column=column
 *    onUpdateFormat = (action 'onUpdateFormat')
 *  }}
 */

import Component from '@ember/component';
import layout from '../templates/components/number-format-dropdown';
import { assign } from '@ember/polyfills';
import { oneWay } from '@ember/object/computed';
import { getWithDefault } from '@ember/object';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['number-format-dropdown'],

  /**
   * @property {String} format
   */
  format: oneWay('column.format'),

  actions: {
    /**
     * @action updateColumnNumberFormat
     */
    updateColumnNumberFormat() {
      let { onUpdateReport, column } = this.attrs,
          format = getWithDefault(this, 'format', column.format);

      onUpdateReport('updateColumn', assign({}, column, { format }));
    }
  }
});
