/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DataGroup from 'navi-core/utils/classes/data-group';
import { assert } from '@ember/debug';
import { maxBy } from 'lodash-es';
import { ResponseV1 } from 'navi-data/serializers/facts/interface';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

type ResponseRow = ResponseV1['rows'][number];

/**
 * Trim rows to a max of n values, sorted by highest value for given metric.
 *
 * @param rows - data rows to trim
 * @param metric - canonical name of metric used for sorting
 * @param n - max number of rows
 * @returns - n (or less) rows sorted by metric
 */
export function topN(rows: ResponseRow[], metric: string, n: number): ResponseRow[] {
  let sortedRows = rows.sort((a, b) => Number(b[metric]) - Number(a[metric]));

  return sortedRows.slice(0, n);
}

/**
 * Parses data for most recent dateTime value and pulls all rows matching that value.
 *
 * @param rows - rows to parse by dateTime
 * @returns all data rows containing the most recent dateTime
 */
export function mostRecentData(rows: ResponseRow[], timeDimensionColumn?: string): ResponseRow[] {
  const column = timeDimensionColumn || Object.keys(rows[0]).find(c => c.includes('.dateTime'));
  assert('Should define a timeDimensionColumn to find data by', column !== undefined);
  const byDate = new DataGroup(rows, row => row[column] as string);
  const sortedDates = byDate.getKeys().sort();
  const mostRecentDate = sortedDates[sortedDates.length - 1];

  return byDate.getDataForKey(mostRecentDate);
}

/**
 * group rows based on dimensions
 *
 * @param rows - rows to parse by dimensions
 * @param dimensionOrder
 */
export function dataByDimensions(rows: ResponseRow[], dimensions: ColumnFragment[]): DataGroup<ResponseRow> {
  return new DataGroup(rows, row => dimensions.map(dimension => row[dimension.canonicalName]).join('|'));
}

/**
 * Parses data for max value by dimensions
 *
 * @param rows - rows to parse by dimensions
 * @param dimensionOrder
 * @param metric - canonical name of metric used for sorting
 * @returns {Array} all data rows for max value based on dimensions
 */
export function maxDataByDimensions(
  rows: ResponseV1['rows'],
  dimensions: ColumnFragment[],
  metric: string
): ResponseRow[] {
  const data = dataByDimensions(rows, dimensions);
  const keys = data.getKeys();

  return keys.map(key => maxBy(data.getDataForKey(key), (row: ResponseRow) => Number(row[metric])) as ResponseRow);
}
