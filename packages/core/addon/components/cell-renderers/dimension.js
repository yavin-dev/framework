/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{cell-renderers/dimension
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import layout from '../../templates/components/cell-renderers/dimension';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'dimension'],

  /**
   * @property {String} descField - field to find the description
   */
  descField: computed('column.field.dimension', function() {
    return get(this, 'column.field.dimension') + '|desc';
  }),

  /**
   * @property {String} idField - field to find id
   */
  idField: computed('column.field.dimension', function() {
    return get(this, 'column.field.dimension') + '|id';
  }),

  /**
   * @property {String} title - value that should be used in hoverover title
   */
  title: computed('descField', 'idField', 'data', function() {
    let descField = get(this, 'descField'),
      idField = get(this, 'idField'),
      data = get(this, 'data');

    if (data[idField] && data[descField]) {
      return `${data[descField]} (${data[idField]})`;
    } else if (data[idField]) {
      return data[idField];
    } else if (data[descField]) {
      return data[descField];
    }

    return '';
  }),

  /**
   * @property {String} value - value that should be displayed in table cell
   */
  value: computed('descField', 'idField', 'data', function() {
    let descField = get(this, 'descField'),
      idField = get(this, 'idField'),
      data = get(this, 'data');

    if (data[descField]) {
      return data[descField];
    } else if (data[idField]) {
      return data[idField];
    }

    return '--';
  })
});
