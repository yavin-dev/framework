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
import { computed } from '@ember/object';
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
  supportedOperators = [
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

  /**
   * @property {Object} filter
   * @override
   */
  @computed('requestFragment.{operator,dimension,values.[]}')
  get filter() {
    const { requestFragment } = this;
    const serializedFilter =
      typeof requestFragment.serialize === 'function' ? requestFragment.serialize() : requestFragment;

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
