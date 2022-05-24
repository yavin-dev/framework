/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import { w } from '@ember/string';
import { getPaginatedRecords } from '@yavin/client/utils/pagination';
import type NativeArray from '@ember/array';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import MutableArray from '@ember/array/mutable';
import { sortBy } from 'lodash-es';

/**
 * Computes how closely two strings match, ignoring word order.
 * The higher the weight, the farther apart the two strings are.
 *
 * @param string - text being search
 * @param query - search query
 * @returns Number representing how close query matches string
 *           undefined if no match
 */
export function getPartialMatchWeight(string: string, query: string): number | undefined {
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
}

/**
 * Computes how closely two strings match, using exact text matching.
 * The higher the weight, the farther apart the two strings are.
 *
 * @param string - text being search
 * @param query - search query
 * @returns Number representing how close query matches string
 *           undefined if no match
 */
export function getExactMatchWeight(string: string, query: string): number | undefined {
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
 * @param records - collection of records to search
 * @param query - search query used to filter and rank records
 * @param searchField - field in record to compare
 * @returns array of matching records
 */
export function searchRecords(records: object[], query: string, searchField: string) {
  const results = A();
  query = query.toLowerCase();

  for (let i = 0; i < records.length; i++) {
    let record = records[i] as Record<string, string>;
    const relevance = getPartialMatchWeight(record[searchField].toLowerCase(), query);

    if (relevance) {
      results.push({ relevance, record });
    }
  }

  return A(results.sortBy('relevance')).mapBy('record');
}

/**
 * Searches dimension records and returns filtered results sorted by relevance
 *
 * @param records - collection of records to search
 * @param query - search query used to filter and rank assets
 * @param resultLimit - maximum number of results
 * @param page - page number starting from page 1
 * @returns array of objects in the following form:
 *          record - asset record
 *          relevance - distance between record and search query
 */
export function searchDimensionRecords(
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
    let nonIdMatchWeight = getPartialMatchWeight(
        (Object.values(rest).join(' ') || '').toLowerCase(),
        query.toLowerCase()
      ),
      idMatchWeight = getExactMatchWeight((id || '').toLowerCase(), query.toLowerCase()),
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

  results = sortBy(results, (result) => result.relevance);

  return getPaginatedRecords(results, resultLimit, page);
}

/**
 * Searches noramlized dimension records and returns filtered results sorted by relevance
 *
 * @param records - collection of dimension records to search
 * @param query - search query used to filter and rank assets
 * @returns matching dimensin records
 */
export function searchNaviDimensionRecords(
  records: NaviDimensionModel[],
  query: string
): { values: NaviDimensionModel[] } {
  let results: MutableArray<{ record: NaviDimensionModel; relevance: number }> = A();

  // Filter, map, and sort records based on how close each record is to the search query
  records.forEach((record) => {
    // Determine relevance based on string match weight
    const { value, suggestions } = record;
    const searchString = suggestions ? (Object.values(suggestions).join(' ') || '').toLowerCase() : '';
    const valueMatchWeight = getExactMatchWeight(((value as string) || '').toLowerCase(), query.toLowerCase());
    const suggestionMatchWeight = getPartialMatchWeight(searchString, query.toLowerCase());
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
}
