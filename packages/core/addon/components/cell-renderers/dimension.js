/**
 * Copyright 2019, Yahoo Holdings Inc.
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
import { isEmpty } from '@ember/utils';

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
   * @property {Object} dimensionField - field to find dimension field
   */
  dimensionField: computed('column.field.dimension', 'column.field.field', function() {
    if (!get(this, 'column.field.field')) {
      return null;
    }

    return `${get(this, 'column.field.dimension')}|${get(this, 'column.field.field')}`;
  }),

  /**
   * @property {String} title - value that should be used in hoverover title
   */
  title: computed('dimensionField', 'descField', 'idField', 'data', function() {
    if (get(this, 'dimensionField')) {
      return '';
    }

    let descField = get(this, 'descField'),
      idField = get(this, 'idField'),
      data = get(this, 'data');

    if (!isEmpty(data[idField]) && !isEmpty(data[descField])) {
      return `${data[descField]} (${data[idField]})`;
    } else if (!isEmpty(data[idField])) {
      return data[idField];
    } else if (!isEmpty(data[descField])) {
      return data[descField];
    }

    return '';
  }),

  /**
   * @property {String} value - value that should be displayed in table cell
   */
  value: computed('dimensionField', 'descField', 'idField', 'data', function() {
    let dimensionField = get(this, 'dimensionField'),
      descField = get(this, 'descField'),
      idField = get(this, 'idField'),
      data = get(this, 'data');

    if (dimensionField) {
      if (!isEmpty(data[dimensionField])) {
        return data[dimensionField];
      }
    } else if (!isEmpty(data[descField])) {
      return data[descField];
    } else if (!isEmpty(data[idField])) {
      return data[idField];
    }

    return '--';
  })
});
