/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseComponent from './base';
import { computed } from '@ember/object';
import { A as arr } from '@ember/array';

export default class FilterBuildersNumberDimension extends BaseComponent {
  /**
   * @property {Object} requestFragment - filter fragment from request model
   * @type Any
   */
  requestFragment = undefined;

  /**
   * @property {Array} supportedOperators
   * @override
   */
  get supportedOperators() {
    return [
      {
        id: 'gt',
        name: 'Greater than (>)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'gte',
        name: 'Greater than or equals (>=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lt',
        name: 'Less than (<)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lte',
        name: 'Less than or equals (<=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'eq',
        name: 'Equals (=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'neq',
        name: 'Not equals (!=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'bet',
        name: 'Between (<=>)',
        valuesComponent: 'filter-values/range-input'
      },
      {
        id: 'nbet',
        name: 'Not between (!<=>)',
        valuesComponent: 'filter-values/range-input'
      }
    ];
  }

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.{operator,dimension,values.[]}')
  get filter() {
    const { requestFragment } = this;
    const serializedFilter =
      typeof requestFragment?.serialize === 'function' ? requestFragment.serialize() : requestFragment;

    const { values } = serializedFilter;

    const { dimension, operator: operatorId } = requestFragment;
    const operator = arr(this.supportedOperators).findBy('id', operatorId);

    return {
      subject: dimension,
      operator,
      values: arr(values)
    };
  }
}
