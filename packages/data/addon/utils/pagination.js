/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { assert } from '@ember/debug';

import { typeOf } from '@ember/utils';

export default {

  /**
   * Gets the paginated records given the page number and limit
   *
   * @method getPaginatedRecords
   * @param {Array} allRecords - array of records to be paginated
   * @param {Number} [limit] - number of records per page
   * @param {Number} [page] - page number
   */
  getPaginatedRecords(allRecords, limit, page) {

    assert('allRecords param must be defined', allRecords);
    if (limit) {
      assert('Limit must be of type number', typeOf(limit) === 'number');
    }
    if (page) {
      assert('Invalid page/limit specified', (typeOf(page) === 'number') && limit);
    }

    let startIndex = (page - 1) * limit || 0,
        endIndex = (page * limit) || limit;

    return allRecords.slice(startIndex, endIndex);
  }
};
