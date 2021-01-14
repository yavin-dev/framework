/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import BaseFilterBuilderComponent from './base';

export default class MetricFilterBuilderComponent extends BaseFilterBuilderComponent {
  get valueBuilders() {
    return [
      {
        operator: 'gt' as const,
        name: 'Greater than (>)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'gte' as const,
        name: 'Greater than or equals (>=)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'lt' as const,
        name: 'Less than (<)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'lte' as const,
        name: 'Less than or equals (<=)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'eq' as const,
        name: 'Equals (=)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'neq' as const,
        name: 'Not equals (!=)',
        component: 'filter-values/value-input'
      },
      {
        operator: 'bet' as const,
        name: 'Between (<=>)',
        component: 'filter-values/range-input'
      },
      {
        operator: 'nbet' as const,
        name: 'Not between (!<=>)',
        component: 'filter-values/range-input'
      }
    ];
  }
}
