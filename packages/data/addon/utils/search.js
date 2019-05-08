/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { w } from '@ember/string';
import { getWithDefault, get } from '@ember/object';
import PaginationUtils from './pagination';

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
  getPartialMatchWeight(string, query) {
    // Split search query into individual words
    var searchTokens = w(query.trim()),
      allTokensFound = true;

    // Check that all words in the search query can be found in the given string
    for (var i = 0; i < searchTokens.length; i++) {
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
  getExactMatchWeight(string, query) {
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
  searchDimensionRecords: function(records, query, resultLimit, page) {
    let results = [],
      record;

    // Filter, map, and sort records based on how close each record is to the search query
    for (let i = 0; i < get(records, 'length'); i++) {
      record = records.objectAt(i);

      // Determine relevance based on string match weight
      let descriptionMatchWeight = this.getPartialMatchWeight(
          getWithDefault(record, 'description', '').toLowerCase(),
          query.toLowerCase()
        ),
        idMatchWeight = this.getExactMatchWeight(getWithDefault(record, 'id', '').toLowerCase(), query.toLowerCase()),
        relevance = descriptionMatchWeight || idMatchWeight;

      // If both id and description match the query, take the most relevant
      if (descriptionMatchWeight && idMatchWeight) {
        relevance = Math.min(descriptionMatchWeight, idMatchWeight);
      }

      if (relevance) {
        // If record matched search query, include it in the filtered results in the desire form
        results.push({
          relevance: relevance,
          record: record
        });
      }
    }

    results = A(results).sortBy('relevance');

    return PaginationUtils.getPaginatedRecords(results, resultLimit, page);
  }
};
