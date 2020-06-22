/**
 * Copyright 2020, Yahoo Holdings Inc.
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
import { computed } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import layout from '../../templates/components/navi-cell-renderers/dimension';
import { isEmpty } from '@ember/utils';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
export default class DimensionCellRenderer extends Component {
  /**
   * @property {String} name - dimension name
   */
  @readOnly('column.attributes.name')
  name;

  /**
   * @property {String} descField - field to find the description
   */
  @computed('name')
  get descField() {
    return `${this.name}|desc`;
  }

  /**
   * @property {String} idField - field to find id
   */
  @computed('name')
  get idField() {
    return `${this.name}|id`;
  }

  /**
   * @property {Object} dimensionField - field to find dimension field
   */
  @computed('name', 'column.attributes.field')
  get dimensionField() {
    const field = this.column?.attributes.field;
    return field ? `${this.name}|${field}` : null;
  }

  /**
   * @property {String} title - value that should be used in hoverover title
   */
  @computed('dimensionField', 'descField', 'idField', 'data')
  get title() {
    if (this.dimensionField) {
      return '';
    }

    const { descField, idField, data } = this;

    if (!isEmpty(data?.[idField]) && !isEmpty(data[descField])) {
      return `${data[descField]} (${data[idField]})`;
    } else if (!isEmpty(data?.[idField])) {
      return data[idField];
    } else if (!isEmpty(data?.[descField])) {
      return data[descField];
    }

    return '';
  }

  /**
   * @property {String} value - value that should be displayed in table cell
   */
  @computed('dimensionField', 'descField', 'idField', 'data')
  get value() {
    const { dimensionField, descField, idField, data } = this;

    if (dimensionField) {
      if (!isEmpty(data?.[dimensionField])) {
        return data[dimensionField];
      }
    } else if (!isEmpty(data?.[descField])) {
      return data[descField];
    } else if (!isEmpty(data?.[idField])) {
      return data[idField];
    }

    return '--';
  }
}
