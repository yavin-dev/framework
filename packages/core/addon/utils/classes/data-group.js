/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Ember from 'ember';

/**
 * DataGroup
 * Groups large data sets for quick access
 *
 * @class
 */
export default class DataGroup {

  /**
   * @param {Array} rows - data to group
   * @param {Function} groupingFn - function that takes a data row and returns the key to group it by
   */
  constructor(rows, groupingFn) {
    Ember.assert('Data rows must be defined', rows);
    Ember.assert('Grouping function must be defined', typeof groupingFn === 'function');

    let map = {},
        i, key, row;

        // Build a map of keys to data rows
    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      key = groupingFn(row);

      if (map[key]) {
        map[key].push(row);
      } else {
        map[key] = [row];
      }
    }

    this._rowsByKey = map;
  }

  /**
   * @method getDataForKey
   * @param {String} key
   * @returns {Array} data associated with given key
   */
  getDataForKey(key) {
    return this._rowsByKey[key];
  }

  /**
   * @method getKeys
   * @returns {Array} set of all keys associated with given data
   */
  getKeys() {
    return Object.keys(this._rowsByKey);
  }
}
