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
export function parseFilters(filtersParam) {
  if (!filtersParam) {
    return [];
  }
  const filterStrings = (filtersParam + ',')
    .split('],')
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

/**
 * Parses a string of metrics into an array of metrics
 * @param {String} metricsParam - the raw having query param `metrics=some(param=a),or,normalMetrics`
 * @returns {Array} metrics
 */
export function parseMetrics(metricsParam) {
  if (!metricsParam) {
    return [];
  }

  const metrics = [];
  const str = `${metricsParam},`;
  let lastStrIndex = 0;
  let inParen = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      inParen++;
      continue;
    } else if (str[i] === ')') {
      inParen--;
      continue;
    } else if (inParen === 0 && str[i] === ',') {
      metrics.push(str.slice(lastStrIndex, i));
      lastStrIndex = i + 1;
    }
  }
  return metrics;
}
