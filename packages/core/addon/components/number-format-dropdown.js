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
import { oneWay } from '@ember/object/computed';
import { get, getWithDefault } from '@ember/object';
import { merge } from 'lodash-es';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames
   */
  classNames: ['number-format-dropdown'],

  /**
   * @property {String} format
   */
  format: oneWay('column.attributes.format'),

  actions: {
    /**
     * @action updateColumnNumberFormat
     */
    updateColumnNumberFormat() {
      let { onUpdateReport, column } = this,
        format = getWithDefault(this, 'format', get(column, 'attributes.format')),
        updatedColumn = merge({}, column, { attributes: { format } });

      onUpdateReport('updateColumn', updatedColumn);
    }
  }
});
