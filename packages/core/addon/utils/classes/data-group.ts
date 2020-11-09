/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { assert } from '@ember/debug';

/**
 * DataGroup
 * Groups large data sets for quick access
 */
export default class DataGroup<T> {
  private _rowsByKey: Record<string, T[]>;

  /**
   * @param {Array} rows - data to group
   * @param {Function} groupingFn - function that takes a data row and returns the key to group it by
   */
  constructor(rows: T[], groupingFn: (row: T) => string) {
    assert('Data rows must be defined', rows);
    assert('Grouping function must be defined', typeof groupingFn === 'function');

    const map: Record<string, T[]> = {};

    let i: number;
    // Build a map of keys to data rows
    for (i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = groupingFn(row);

      if (map[key]) {
        map[key].push(row);
      } else {
        map[key] = [row];
      }
    }

    this._rowsByKey = map;
  }

  /**
   * @param key
   * @returns data associated with given key
   */
  getDataForKey(key: string): T[] {
    return this._rowsByKey[key];
  }

  /**
   * @returns set of all keys associated with given data
   */
  getKeys(): string[] {
    return Object.keys(this._rowsByKey);
  }
}
