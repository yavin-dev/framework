/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { w } from '@ember/string';
import PaginationUtils from './pagination';
import type NativeArray from '@ember/array';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import MutableArray from '@ember/array/mutable';

export default {
  /**
   * Computes how closely two strings match, ignoring word order.
   * The higher the weight, the farther apart the two strings are.
   *
   * @method getPartialMatchWeight
   * @param {String} string - text being search
   * @param {String} query - search query
   * @returns {Number|undefined}
   *           Number representing how close query matches string
   *           undefined if no match
   */
  getPartialMatchWeight(string: string, query: string): number | undefined {
    // Split search query into individual words
    let searchTokens = w(query.trim()),
      allTokensFound = true;

    // Check that all words in the search query can be found in the given string
    for (let i = 0; i < searchTokens.length; i++) {
      if (string.indexOf(searchTokens[i]) === -1) {
        allTokensFound = false;
        break;
      }
    }

    if (allTokensFound) {
      // Compute match weight
      return string.length - query.trim().length + 1;
    }

    // Undefined weight if no match at all
    return undefined;
  },

  /**
   * Computes how closely two strings match, using exact text matching.
   * The higher the weight, the farther apart the two strings are.
   *
   * @method getExactMatchWeight
   * @param {String} string - text being search
   * @param {String} query - search query
   * @returns {Number|undefined}
   *           Number representing how close query matches string
   *           undefined if no match
   */
  getExactMatchWeight(string: string, query: string): number | undefined {
    if (string.indexOf(query) !== -1) {
      // Compute match weight
      return string.length - query.length + 1;
    }

    // Undefined weight if no match at all
    return undefined;
  },

  /**
   * Searches dimension records and returns filtered results sorted by relevance
   *
   * @method searchDimensionRecords
   * @param {Array} records - collection of records to search
   * @param {String} query - search query used to filter and rank assets
   * @param {Number} resultLimit - maximum number of results
   * @param {Number} [page] - page number starting from page 1
   * @returns {Array} array of objects in the following form:
   *          record - asset record
   *          relevance - distance between record and search query
   */
  searchDimensionRecords(
    records: NativeArray<unknown>,
    query: string,
    resultLimit: number,
    page = 1
  ): { record: Record<string, string>; relevance: number }[] {
    let results = [],
      record;

    // Filter, map, and sort records based on how close each record is to the search query
    for (let i = 0; i < records.length; i++) {
      record = records.objectAt(i) as Record<string, string>;

      // Determine relevance based on string match weight
      const { id, ...rest } = record;
      let nonIdMatchWeight = this.getPartialMatchWeight(
          (Object.values(rest).join(' ') || '').toLowerCase(),
          query.toLowerCase()
        ),
        idMatchWeight = this.getExactMatchWeight((id || '').toLowerCase(), query.toLowerCase()),
        relevance = nonIdMatchWeight || idMatchWeight;

      // If both id and description match the query, take the most relevant
      if (nonIdMatchWeight && idMatchWeight) {
        relevance = Math.min(nonIdMatchWeight, idMatchWeight);
      }

      if (relevance) {
        // If record matched search query, include it in the filtered results in the desire form
        results.push({
          relevance: relevance,
          record: record,
        });
      }
    }

    results = A(results).sortBy('relevance');

    return PaginationUtils.getPaginatedRecords(results, resultLimit, page);
  },

  /**
   * Searches noramlized navi dimension records and returns filtered results sorted by relevance
   *
   * @method searchDimensionRecords
   * @param {Array} records - collection of records to search
   * @param {String} query - search query used to filter and rank assets
   * @param {Number} resultLimit - maximum number of results
   * @param {Number} [page] - page number starting from page 1
   * @returns {values: NaviDimensionModel}
   */
  searchNaviDimensionRecords(records: NaviDimensionModel[], query: string): { values: NaviDimensionModel[] } {
    let results: MutableArray<{ record: NaviDimensionModel; relevance: number }> = A();

    // Filter, map, and sort records based on how close each record is to the search query
    records.forEach((record) => {
      // Determine relevance based on string match weight
      const { value, suggestions } = record;
      const searchString = suggestions ? (Object.values(suggestions).join(' ') || '').toLowerCase() : '';
      const valueMatchWeight = this.getExactMatchWeight(((value as string) || '').toLowerCase(), query.toLowerCase());
      const suggestionMatchWeight = this.getPartialMatchWeight(searchString, query.toLowerCase());
      let relevance = suggestionMatchWeight || valueMatchWeight;

      // If both id and description match the query, take the most relevant
      if (suggestionMatchWeight && valueMatchWeight) {
        relevance = Math.min(suggestionMatchWeight, valueMatchWeight);
      }

      if (relevance) {
        // If record matched search query, include it in the filtered results in the desire form
        results.pushObject({
          relevance: relevance,
          record: record,
        });
      }
    });

    results = results.sortBy('relevance');

    return {
      values: results.map((val) => val.record),
    };
  },
};
