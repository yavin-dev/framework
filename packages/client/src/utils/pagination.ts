/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import invariant from 'tiny-invariant';

/**
 * Gets the paginated records given the page number and limit
 *
 * @param allRecords - array of records to be paginated
 * @param limit - number of records per page
 * @param page - page number
 */
export function getPaginatedRecords<T>(allRecords: Array<T>, limit?: number, page?: number): Array<T> {
  invariant(allRecords, 'allRecords param must be defined');
  if (limit) {
    invariant(typeof limit === 'number', 'Limit must be of type number');
  }
  if (page) {
    invariant(typeof page === 'number' && limit, 'Invalid page/limit specified');
  }

  const startIndex = page && limit ? (page - 1) * limit : 0;
  const endIndex = page && limit ? page * limit : limit;

  return allRecords.slice(startIndex, endIndex);
}
