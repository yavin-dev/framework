/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/date-dimension
 *       requestFragment=request.filters.firstObject
 *       request=request
 *   }}
 */
import Base from './base';
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';

export default Base.extend({
  /**
   * @property {Object} requestFragment - interval fragment from request
   */
  requestFragment: undefined,

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: computed(function() {
    return [
      {
        id: 'gte',
        longName: 'Since (>=)',
        valuesComponent: 'filter-values/date'
      },
      {
        id: 'lt',
        longName: 'Before (<)',
        valuesComponent: 'filter-values/date'
      },
      {
        id: 'bet',
        longName: 'Between (<=>)',
        valuesComponent: 'filter-values/dimension-date-range'
      }
    ];
  }),

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,dimension,values.[]}', function() {
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
  })
});
