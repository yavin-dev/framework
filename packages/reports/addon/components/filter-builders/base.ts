/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */

import Component from '@ember/component';
import { action } from '@ember/object';
import layout from 'navi-reports/templates/components/filter-builders/base';
import { readOnly } from '@ember/object/computed';
import { layout as templateLayout, tagName } from '@ember-decorators/component';
import { A as arr } from '@ember/array';

@templateLayout(layout)
@tagName('')
class BaseFilterBuilderComponent extends Component {
  onUpdateFilter: any;
  /**
   * @property {Object} filter
   * @property {String} primaryKeyField
   */
  get filter(): any {
    return undefined;
  }
  get primaryKeyField(): any {
    return undefined;
  }
  /**
   * @property {function} onUpdateFilter
   */
  /**
   * @property {String} displayName - display name for the filter
   */
  @readOnly('filter.columnMetadata.name') displayName: any;

  /**
   * @property {Array} supportedOperators - list of valid values for filter.operator
   */
  get supportedOperators(): Array<{}> {
    return [];
  }
  /**
   * @action setOperator
   * @param {Object} operatorObject - a value from supportedOperators that should become the filter's operator
   */
  @action
  setOperator(operatorObject: { id: any; valuesComponent: any; showFields: any }) {
    const { primaryKeyField } = this;
    let changeSet = { operator: operatorObject.id };
    /*
     * Clear values in case they are incompatible with new operator,
     * unless operators share valuesComponent
     */
    if (this.selectedOperator.valuesComponent !== operatorObject.valuesComponent) {
      Object.assign(changeSet, { values: [] });
    }

    //switch field to primary key if operator does not allow choosing fields
    if (primaryKeyField && !operatorObject.showFields) {
      Object.assign(changeSet, { field: primaryKeyField });
    }

    this.onUpdateFilter(changeSet);
  }

  get selectedOperator(): any {
    return arr(this.supportedOperators).findBy('id', this.filter.operator);
  }
}

export default BaseFilterBuilderComponent;
