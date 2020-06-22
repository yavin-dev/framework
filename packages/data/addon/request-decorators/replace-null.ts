/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assign } from '@ember/polyfills';

const NULL_STRING_VALUE = '';

/**
 * Replaces values and operator for 'null' and 'notnull' filters
 *
 * @method NullFilterDecorator
 * @param {Object} request - object with filters to replace
 * @returns {Object} new request object with updated filters
 */
export function replaceNullFilter(request: TODO) {
  // only decorate if the request and the filters array are defined
  if (request?.filters) {
    const updatedFilters = request.filters.map((filter: TODO) => {
      // Update any filter that matches the given dimension
      if (filter.operator === 'null' || filter.operator === 'notnull') {
        // Build new value array and replace id with newIds
        const newValues = [NULL_STRING_VALUE];
        const newOperator = filter.operator === 'null' ? 'in' : 'notin';
        return assign({}, filter, { values: newValues, operator: newOperator });
      }
      return filter;
    });

    return assign({}, request, { filters: updatedFilters });
  }
  return request;
}
