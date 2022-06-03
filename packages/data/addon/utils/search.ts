/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { A } from '@ember/array';
import NaviDimensionModel from 'navi-data/models/navi-dimension';
import MutableArray from '@ember/array/mutable';
import { getExactMatchWeight, getPartialMatchWeight } from '@yavin/client/utils/search';

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
