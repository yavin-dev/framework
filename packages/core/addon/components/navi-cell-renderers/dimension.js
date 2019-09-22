/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 * {{navi-cell-renderers/dimension
 *   data=row
 *   column=column
 *   request=request
 * }}
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import layout from '../../templates/components/navi-cell-renderers/dimension';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  layout,

  /**
   * @property {Array} classNames - list of component class names
   */
  classNames: ['table-cell-content', 'dimension'],

  /**
   * @property {String} name - dimension name
   */
  name: readOnly('column.attributes.name'),

  /**
   * @property {String} descField - field to find the description
   */
  descField: computed('name', function() {
    return get(this, 'name') + '|desc';
  }),

  /**
   * @property {String} idField - field to find id
   */
  idField: computed('name', function() {
    return get(this, 'name') + '|id';
  }),

  /**
   * @property {Object} dimensionField - field to find dimension field
   */
  dimensionField: computed('name', 'column.attributes.field', function() {
    let field = get(this, 'column.attributes.field');
    return field ? `${get(this, 'name')}|${field}` : null;
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
