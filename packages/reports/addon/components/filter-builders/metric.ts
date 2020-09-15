/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseFilterBuilderComponent from './base';

export default class MetricFilterBuilderComponent extends BaseFilterBuilderComponent {
  /**
   * @property {Object[]} supportedOperators
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
}
