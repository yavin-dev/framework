/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import BaseFilterBuilderComponent from './base';

export default class DateDimensionFilterBuilderComponent extends BaseFilterBuilderComponent {
  get supportedOperators() {
    return [
      {
        id: 'gte',
        name: 'Since (>=)',
        valuesComponent: 'filter-values/date'
      },
      {
        id: 'lt',
        name: 'Before (<)',
        valuesComponent: 'filter-values/date'
      },
      {
        id: 'bet',
        name: 'Between (<=>)',
        valuesComponent: 'filter-values/dimension-date-range'
      }
    ];
  }
}
