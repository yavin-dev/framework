/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

const { assign } = Ember;

const NULL_STRING_VALUE = '""';

/**
 * Replaces values and operator for 'null' and 'notnull' filters
 *
 * @method NullFilterDecorator
 * @param {Object} request - object with filters to replace
 * @returns {Object} new request object with updated filters
 */
export function replaceNullFilter(request) {
  // only decorate if the request and the filters array are defined
  if (request && request.filters) {
    let updatedFilters = request.filters.map((filter) => {

      // Update any filter that matches the given dimension
      if (filter.operator === 'null' || filter.operator === 'notnull') {

        // Build new value array and replace id with newIds
        let newValues = [NULL_STRING_VALUE],
            newOperator = filter.operator === 'null' ? 'in' : 'notin';
        return assign({}, filter, {values: newValues, operator: newOperator});
      }
      return filter;
    });

    return assign({}, request, {filters: updatedFilters});
  }
  return request;
}
