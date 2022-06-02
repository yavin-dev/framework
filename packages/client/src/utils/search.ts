/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { getPaginatedRecords } from './pagination.js';
import sortBy from 'lodash/sortBy.js';

function words(str: string): string[] {
  return str.split(/\s+/);
}

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
  let searchTokens = words(query.trim()),
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
 * Computes how closely two strings match but the
 * matching strings must start with the search token
 *
 * @param string - text being search
 * @param query - search query
 * @returns Number representing how close query matches string
 *           undefined if no match
 */
export function getStrictPartialMatchWeight(string: string, query: string): number | undefined {
  // Split search query into individual words
  let searchTokens = words(query.trim()),
    origString = string,
    stringTokens = words(string),
    allTokensFound = true;

  // ignore special characters unless query also contains them
  const specChar = new RegExp(/[^\w\s]/gi);
  if (!specChar.test(query)) {
    origString = origString.replaceAll(specChar, '');
    stringTokens = stringTokens.map((token) => token.replaceAll(specChar, ''));
  }

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
    } else if (stringTokens.every((token) => !token.startsWith(searchTokens[i]))) {
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
  const results = [];
  query = query.toLowerCase();

  for (let i = 0; i < records.length; i++) {
    let record = records[i] as Record<string, string>;
    const relevance = getStrictPartialMatchWeight(record[searchField].toLowerCase(), query);

    if (relevance) {
      results.push({ relevance, record });
    }
  }

  return sortBy(results, (result) => result.relevance).map((r) => r.record);
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
export function searchDimensionRecords<T extends Record<string, unknown>>(
  records: ArrayLike<T>,
  query: string,
  resultLimit: number,
  page = 1
): Array<{ record: T; relevance: number }> {
  let results = [],
    record;

  // Filter, map, and sort records based on how close each record is to the search query
  for (let i = 0; i < records.length; i++) {
    record = records[i];

    // Determine relevance based on string match weight
    const { id, ...rest } = record;
    let nonIdMatchWeight = getPartialMatchWeight(
        (Object.values(rest).join(' ') || '').toLowerCase(),
        query.toLowerCase()
      ),
      idMatchWeight = getExactMatchWeight(`${id || ''}`.toLowerCase(), query.toLowerCase()),
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
