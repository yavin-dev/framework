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
        id: 'gt' as const,
        name: 'Greater than (>)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'gte' as const,
        name: 'Greater than or equals (>=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lt' as const,
        name: 'Less than (<)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'lte' as const,
        name: 'Less than or equals (<=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'eq' as const,
        name: 'Equals (=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'neq' as const,
        name: 'Not equals (!=)',
        valuesComponent: 'filter-values/value-input'
      },
      {
        id: 'bet' as const,
        name: 'Between (<=>)',
        valuesComponent: 'filter-values/range-input'
      },
      {
        id: 'nbet' as const,
        name: 'Not between (!<=>)',
        valuesComponent: 'filter-values/range-input'
      }
    ];
  }
}
