/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Utilities for parsing RSQL.
 */

/**
 * @method getFilterParams
 * @param {String} queryFilter
 * @returns {Array} Filter parameters
 * @description Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to a list of all the OR parameters, ie., [H, Revenue]
 */
export function getFilterParams(queryFilter) {
  if (queryFilter != null && queryFilter != '') {
    if (queryFilter.includes('author')) {
      queryFilter = queryFilter.split(';')[0];
    }
    return queryFilter
      .replace(/[()*]/g, '')
      .split(',')
      .map(el => el.split('=='));
  }
  return null;
}

/**
 * @method getQueryAuthor
 * @param {String} queryFilter
 * @returns Author
 * @description Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to get the author, ie., ramvish
 */
export function getQueryAuthor(queryFilter) {
  if (queryFilter != null && queryFilter != '' && queryFilter.includes('author')) {
    if (queryFilter.includes('(')) {
      queryFilter = queryFilter.split(';')[1];
    }
    return queryFilter.match(/\*(.*?)\*/)[0].replace(/\*/g, '');
  }
  return null;
}
