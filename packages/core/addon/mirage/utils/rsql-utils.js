/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Utilities for parsing RSQL.
 */

import Response from 'ember-cli-mirage/response';

/**
 * @method getFilterParams – Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to a list of all the OR parameters, ie., [H, Revenue]
 * @param {String} queryFilter
 * @returns {Array} Filter parameters
 */
export function getFilterParams(queryFilter) {
  if (queryFilter && queryFilter.includes('author') && queryFilter.includes(';')) {
    queryFilter = queryFilter.split(';')[0];
    return queryFilter
      .replace(/[()*]/g, '')
      .split(',')
      .map(el => el.split('=='));
  }
  return null;
}

/**
 * @method getQueryAuthor – Parse filter parameters in the form of "(title==*H*,request==*Revenue*)";author==*ramvish*
 * to get the author, ie., ramvish
 * @param {String} queryFilter
 * @returns Author
 */
export function getQueryAuthor(queryFilter) {
  if (queryFilter && queryFilter.includes('author')) {
    if (queryFilter.includes('(')) {
      queryFilter = queryFilter.split(';')[1];
    }
    return queryFilter.match(/\*(.*?)\*/)[0].replace(/\*/g, '');
  }
  return null;
}

export function filterModel(model, queryFilter) {
  let modelObject;
  try {
    let filterParameters = getFilterParams(queryFilter);
    let author = getQueryAuthor(queryFilter);
    if (filterParameters == null && author == null) {
      throw new Error('No search parameters');
    }
    modelObject = model.all().filter(function(report) {
      // Author can be optional, ie., not included in the query, but filterparameters are always included.
      const matchesFilterParameterIfExists = filterParameters
        ? filterParameters.some(filterParameter =>
            JSON.stringify(report[filterParameter[0]]).match(new RegExp(filterParameter[1], 'i'))
          )
        : false;
      const matchesAuthorIfExists = author ? report.author.id.match(new RegExp(author, 'i')) : true;
      return matchesFilterParameterIfExists && matchesAuthorIfExists;
    });
  } catch (error) {
    modelObject = new Response(
      400,
      { data: {} },
      {
        errors: ['InvalidPredicateException: Invalid filter format']
      }
    );
  }
  return modelObject;
}
