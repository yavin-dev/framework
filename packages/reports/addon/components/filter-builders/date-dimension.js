/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   <FilterBuilders::DateDimension
 *       @requestFragment={{this.request.filters.firstObject}}
 *       @request={{this.request}}
 *   />
 */
import BaseFilterBuilderComponent from './base';
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';

export default class DateDimensionFilterBuilderComponent extends BaseFilterBuilderComponent {
  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment = undefined;

  /**
   * @property {Array} supportedOperators
   * @override
   */
  @computed
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

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.{operator,dimension,values.[]}')
  get filter() {
    const requestFragment = get(this, 'requestFragment'),
      serializedFilter =
        typeof requestFragment.serialize === 'function' ? requestFragment.serialize() : requestFragment,
      operatorId = get(requestFragment, 'operator'),
      operator = arr(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(requestFragment, 'dimension'),
      operator,
      values: arr(get(serializedFilter, 'values'))
    };
  }
}
