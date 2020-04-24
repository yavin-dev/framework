/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base class for filter builders.
 */

import Component from '@ember/component';
import { action, computed } from '@ember/object';
import layout from 'navi-reports/templates/components/filter-builders/base';
import { readOnly } from '@ember/object/computed';
import { layout as templateLayout, tagName } from '@ember-decorators/component';

@templateLayout(layout)
@tagName('')
class BaseFilterBuilderComponent extends Component {
  /**
   * @property {Object} filter
   * @property {Object} filter.subject
   * @property {String} filter.subject.name - display name for the filter subject
   * @property {Object} filter.operator - object with the same shape as the objects in `supportedOperators` property
   * @property {String} filter.operator.name - display name for operator
   * @property {String} filter.operator.valuesComponent - name of component to use for selecting filter values
   * @property {Array} filter.values
   */
  get filter() {
    return undefined;
  }

  /**
   * @property {String} displayName - display name for the filter
   */
  @readOnly('filter.subject.name') displayName;

  /**
   * @property {Array} supportedOperators - list of valid values for filter.operator
   */
  @computed
  get supportedOperators() {
    return [];
  }

  /**
   * @action setOperator
   * @param {Object} operatorObject - a value from supportedOperators that should become the filter's operator
   */
  @action
  setOperator(operatorObject) {
    const { filter, primaryKeyField } = this;
    let changeSet = { operator: operatorObject.id };

    /*
     * Clear values in case they are incompatible with new operator,
     * unless operators share valuesComponent
     */
    if (filter?.operator?.valuesComponent !== operatorObject.valuesComponent) {
      Object.assign(changeSet, { values: [] });
    }

    //switch field to primary key if operator does not allow choosing fields
    if (primaryKeyField && !operatorObject.showFields) {
      Object.assign(changeSet, { field: primaryKeyField });
    }

    this.onUpdateFilter(changeSet);
  }
}

export default BaseFilterBuilderComponent;
