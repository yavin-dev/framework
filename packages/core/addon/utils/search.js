/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { get, getWithDefault } from '@ember/object';
import { w as words } from '@ember/string';
import { A as arr } from '@ember/array';
import { getPaginatedRecords } from 'navi-core/utils/pagination';

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
export function getPartialMatchWeight(string, query) {
  // Split search query into individual words
  let searchTokens = words(query.trim()),
    origString = string,
    stringTokens = arr(words(string)),
    allTokensFound = true;

  // Check that all words in the search query can be found in the given string
  for (let i = 0; i < searchTokens.length; i++) {
    if (string.indexOf(searchTokens[i]) === -1) {
      allTokensFound = false;
      break;
      // Remove matched tokens from string as they have already matched
    } else if (stringTokens.includes(searchTokens[i])) {
      string = string.replace(searchTokens[i], '');
      // Partial match of a token must start with the search-token
      // (avoid age matching language)
    } else if (stringTokens.every(token => !token.startsWith(searchTokens[i]))) {
      allTokensFound = false;
      break;
    }
  }

  if (allTokensFound) {
    // Compute match weight
    return origString.length - query.trim().length + 1;
  }

  // Undefined weight if no match at all
  return undefined;
}

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
export function getExactMatchWeight(string, query) {
  if (string.indexOf(query) !== -1) {
    // Compute match weight
    return string.length - query.length + 1;
  }

  // Undefined weight if no match at all
  return undefined;
}

/**
 * Searches records by searchField and returns results sorted by relevance
 *
 * @method searchRecords
 * @param {Array} records - collection of records to search
 * @param {String} query - search query used to filter and rank records
 * @param {String} searchField - field in record to compare
 * @returns {Array} array of matching records
 */
export function searchRecords(records, query, searchField) {
  let results = arr();
  records = arr(records);
  query = query.toLowerCase();

  for (let i = 0; i < records.length; i++) {
    let record = records.objectAt(i),
      relevance = getPartialMatchWeight(get(record, searchField).toLowerCase(), query);

    if (relevance) {
      results.push({ relevance, record });
    }
  }

  return arr(results.sortBy('relevance')).mapBy('record');
}

/**
 * Searches records by an array of searchFields and returns results sorted by relevance
 *
 * @method searchRecordsByFields
 * @param {Array} records - collection of records to search
 * @param {String} query - search query used to filter and rank records
 * @param {Array} searchFields - fields in record to compare
 * @param {Number} threshold – relevance threshold for matching records
 * @returns {Array} array of matching records
 */
export function searchRecordsByFields(records, query, searchFields, threshold) {
  let results = arr();
  records = arr(records);
  query = query.toLowerCase();

  for (let i = 0; i < records.length; i++) {
    let record = records.objectAt(i),
      // Get average relevance between search fields
      relevance = getAverageRelevance(record, query, searchFields);

    if (relevance) {
      results.push({ relevance, record });
    }
  }

  if (threshold) {
    results = arr(results.filter(result => result.relevance <= threshold));
  }

  return arr(results.sortBy('relevance')).mapBy('record');
}

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
export function searchDimensionRecords(records, query, resultLimit, page) {
  let results = arr([]);
  records = arr(records);

  // Filter, map, and sort records based on how close each record is to the search query
  for (let i = 0; i < get(records, 'length'); i++) {
    let record = records.objectAt(i);

    // Determine relevance based on string match weight
    let descriptionMatchWeight = getPartialMatchWeight(get(record, 'description').toLowerCase(), query.toLowerCase()),
      idMatchWeight = getExactMatchWeight(get(record, 'id').toLowerCase(), query.toLowerCase()),
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

  results = results.sortBy('relevance');

  return arr(getPaginatedRecords(results, resultLimit, page));
}

/**
 * Searches dimension records and returns filtered results sorted by relevance
 *
 * @method getAverageRelevance
 * @param {Array} record - Record to search
 * @param {String} query - search query used to filter and rank assets
 * @param {Number} searchFields - Fields in record to compare
 * @returns {Number} Average relevance of record based on the query
 */
export function getAverageRelevance(record, query, searchFields) {
  return (
    searchFields
      .flatMap(searchField => getPartialMatchWeight(getWithDefault(record, searchField, '').toLowerCase(), query))
      .reduce(function(sum, value) {
        return sum + (value || 0);
      }, 0) / searchFields.length
  );
}
