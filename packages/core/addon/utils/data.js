/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';
import DataGroup from 'navi-core/utils/classes/data-group';
import { maxBy } from 'lodash-es';

/**
 * Trim rows to a max of n values, sorted by
 * highest value for given metric.
 *
 * @function topN
 * @param {Array} rows - data rows to trim
 * @param {String} metric - name of metric used for sorting
 * @param {Number} n - max number of rows
 * @returns {Array} - n (or less) rows sorted by metric
 */
export function topN(rows, metric, n) {
  let sortedRows = rows.sort((a, b) => Number(get(b, metric)) - Number(get(a, metric)));

  return sortedRows.slice(0, n);
}

/**
 * Parses data for most recent dateTime value and
 * pulls all rows matching that value.
 *
 * @function mostRecentData
 * @param {Array} rows - rows to parse by dateTime
 * @returns {Array} all data rows containing the most recent dateTime
 */
export function mostRecentData(rows) {
  let byDate = new DataGroup(rows, row => row.dateTime),
    sortedDates = byDate.getKeys().sort(),
    mostRecentDate = sortedDates[sortedDates.length - 1];

  return byDate.getDataForKey(mostRecentDate);
}

/**
 * group rows based on dimensions
 *
 * @function dataByDimensions
 * @param {Array} rows - rows to parse by dimensions
 * @param {Array} dimensionOrder
 * @returns {DataGroup}
 */
export function dataByDimensions(rows, dimensionOrder) {
  return new DataGroup(rows, row =>
    dimensionOrder
      .map(dimension => {
        const field = getDimensionGroupingField([row], dimension);
        return row[field];
      })
      .join('|')
  );
}

/**
 * Selects best available dimension field to group on.
 * Given a response rowSet, tries to find the best identifier field for the given dimension to use.
 * If there is only one available use that. otherwise it will try to find key in preference order:
 * key > id > desc
 *
 * @param {Array} rows
 * @param {String} dimension
 * @returns {String} field
 */
export function getDimensionGroupingField(rows, dimension) {
  const fields = Object.keys(rows[0]).filter(field => field.startsWith(`${dimension}|`));
  if (fields.length === 1) {
    return fields[0];
  }
  //TODO: add meta dataservice to get dimension meta data id field, need to get namespace down here consistently though
  const preferredFields = ['key', 'id', 'desc'];
  for (const field of preferredFields) {
    if (fields.includes(`${dimension}|${field}`)) {
      return `${dimension}|${field}`;
    }
  }
  return fields[0];
}

/**
 * Parses data for max value by dimensions
 *
 * @function maxDataByDimensions
 * @param {Array} rows - rows to parse by dimensions
 * @param {Array} dimensionOrder
 * @param {String} metric - name of metric used for sorting
 * @returns {Array} all data rows for max value based on dimensions
 */
export function maxDataByDimensions(rows, dimensionOrder, metric) {
  let data = dataByDimensions(rows, dimensionOrder),
    keys = data.getKeys();

  return keys.map(key => maxBy(data.getDataForKey(key), row => Number(row[metric])));
}
