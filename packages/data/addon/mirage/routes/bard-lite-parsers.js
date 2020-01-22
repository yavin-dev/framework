/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { parse } from 'papaparse';

const parseConfig = {
  delimiter: ','
};

/**
 * Parses a single filter query param
 * @param {String} serializedFilter - a filter in the format of `dim|field-op[values]`
 * @returns {Object} parsed filter
 */
export function parseSingleFilter(serializedFilter) {
  const [, dimension, field, operator, valuesString] = serializedFilter.match(/(.*)\|(.*)-(.*)\[(.*)\]/);

  // field = field === 'desc' ? 'description' : field;
  const results = parse(valuesString, parseConfig);
  if (results.errors.length) {
    throw new Error('Failed in parseFilter()', results.errors);
  } else if (results.data.length === 0 || results.data[0].length === 0) {
    // parsing a single row of csv values, fail if no values are found
    throw new Error('No filter values found for parseFilter() on', valuesString);
  }

  return { dimension, field, operator, values: results.data[0] };
}

/**
 * Parses the filters query param into an array of filters
 * @param {String} filtersParam - the raw filters query param `filters=dim1|field-op[values],dim2|field-op[values]`
 * @returns {Array} filters
 */
export function parseFilters(filtersParam = '') {
  const filterStrings = filtersParam
    .split(']')
    .filter(f => f.length > 0)
    .map(f => `${f}]`);
  return filterStrings.map(parseSingleFilter);
}

/**
 * Parses a having into an object of metric to its having
 * @param {String} havingParam - the raw having query param `metric-op[values]`
 * @returns {Object} metric to having
 */
export function parseHavings(havingParam) {
  return havingParam.split(']').reduce((havingObj, currHaving) => {
    if (currHaving.length > 0) {
      if (currHaving[0] === ',') currHaving = currHaving.substring(1);
      let [, metric, operator, values] = currHaving.match(new RegExp('(.*)-(.*)\\[(.*)'));
      values = values.split(',');

      havingObj[metric] = { operator, values };
    }

    return havingObj;
  }, {});
}
