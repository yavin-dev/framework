/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { parse, ParseResult } from 'papaparse';

const parseConfig = {
  delimiter: ','
};

type FiliFilterOperator = 'in' | 'notin' | 'contains';
export type FiliFilter = {
  dimension: string;
  field: string;
  operator: FiliFilterOperator;
  values: string[];
};

/**
 * Parses a single filter query param
 * @param serializedFilter - a filter in the format of `dim|field-op[values]`
 * @returns parsed filter
 */
export function parseSingleFilter(serializedFilter: string): FiliFilter {
  const [, dimension, field, operator, valuesString] = serializedFilter.match(/(.*)\|(.*)-(.*)\[(.*)\]/) || [];

  const results: ParseResult<string[]> = parse(valuesString, parseConfig);
  if (results.errors.length) {
    throw new Error(`Failed in parseFilter(), ${JSON.stringify(results.errors)}`);
  } else if (results.data.length === 0 || results.data[0].length === 0) {
    // parsing a single row of csv values, fail if no values are found
    throw new Error(`No filter values found for parseFilter() on ${valuesString}`);
  }

  return { dimension, field, operator: operator as FiliFilterOperator, values: results.data[0] };
}

/**
 * Parses the filters query param into an array of filters
 * @param filtersParam - the raw filters query param `filters=dim1|field-op[values],dim2|field-op[values]`
 * @returns filters
 */
export function parseFilters(filtersParam?: string): FiliFilter[] {
  if (!filtersParam) {
    return [];
  }
  const filterStrings = (filtersParam + ',')
    .split('],')
    .filter(f => f.length > 0)
    .map(f => `${f}]`);
  return filterStrings.map(parseSingleFilter);
}

export type HavingOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'bet' | 'nbet';
export type Havings = { [key: string]: { operator: HavingOperator; values: string[] } };
/**
 * Parses a having into an object of metric to its having
 * @param havingParam - the raw having query param `metric-op[values]`
 * @returns metric to having
 */
export function parseHavings(havingParam?: string): Havings {
  if (!havingParam) {
    return {};
  }

  return havingParam.split(']').reduce((havingObj: Havings, currHaving) => {
    if (currHaving.length > 0) {
      if (currHaving[0] === ',') currHaving = currHaving.substring(1);
      let [, metric, operator, valuesArr] = currHaving.match(new RegExp('(.*)-(.*)\\[(.*)')) || [];
      const values = valuesArr.split(',');

      havingObj[metric] = { operator: operator as HavingOperator, values };
    }

    return havingObj;
  }, {});
}

/**
 * Parses a string of metrics into an array of metrics
 * @param metricsParam - the raw having query param `some(param=a),or,normalMetrics`
 * @returns metrics such as ['some(param=a)', 'or', 'normalMetrics']
 */
export function parseMetrics(metricsParam?: string) {
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

export type FiliDimension = { name: string; show: string[] };
/**
 * Parses a string dimension for the fili webservice
 * @param dimensionParam - the dimension path param
 */
export function parseDimension(dimensionPath: string): FiliDimension {
  const [name, showClause] = dimensionPath.split(';show=');
  const show = (showClause || '').split(',');
  return { name, show };
}
