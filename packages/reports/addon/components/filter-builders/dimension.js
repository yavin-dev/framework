/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Usage:
 *   {{filter-builders/dimension
 *       requestFragment=request.filters.firstObject
 *   }}
 */
import { A } from '@ember/array';

import { get, computed } from '@ember/object';
import Base from './base';

export default Base.extend({
  /**
   * @property {Object} requestFragment - filter fragment from request model
   */
  requestFragment: undefined,

  /**
   * @property {Array} supportedOperators
   * @override
   */
  supportedOperators: computed('requestFragment.dimension', function() {
    let storageStrategy = get(this, 'requestFragment.dimension.storageStrategy'),
      inputComponent = 'filter-values/dimension-select';

    //Allow free form input of dimension values when dimension's storageStrategy is 'none'
    if (storageStrategy === 'none') {
      inputComponent = 'filter-values/multi-value-input';
    }

    return [
      { id: 'in', longName: 'Equals', valuesComponent: inputComponent },
      { id: 'notin', longName: 'Not Equals', valuesComponent: inputComponent },
      {
        id: 'null',
        longName: 'Is Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'notnull',
        longName: 'Is Not Empty',
        valuesComponent: 'filter-values/null-input'
      },
      {
        id: 'contains',
        longName: 'Contains',
        valuesComponent: 'filter-values/multi-value-input'
      }
    ];
  }),

  /**
   * @property {Object} filter
   * @override
   */
  filter: computed('requestFragment.{operator,dimension,rawValues.[]}', function() {
    let dimensionFragment = get(this, 'requestFragment'),
      operatorId = get(dimensionFragment, 'operator'),
      operator = A(get(this, 'supportedOperators')).findBy('id', operatorId);

    return {
      subject: get(dimensionFragment, 'dimension'),
      operator,
      values: get(dimensionFragment, 'rawValues'),
      validations: get(dimensionFragment, 'validations')
    };
  })
});
