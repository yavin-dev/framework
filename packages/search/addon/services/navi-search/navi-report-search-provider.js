/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for reports stored in the persistence layer.
 */

import NaviBaseSearchProviderService from '../navi-base-search-provider';

export default class NaviReportSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property name
   * @override
   */
  name = 'reportSearchProvider';

  /**
   * @property associatedComponent
   */
  associatedComponent = 'navi-report-search-result';

  /**
   * @method constructSearchQuery
   * @private
   * @param {Object} searchParams
   * @param {String} author
   * @returns {Object} search query object
   */
  constructSearchQuery(searchParams, author) {
    let query = { filter: { reports: '' } };

    if (searchParams) {
      for (let p in searchParams) {
        let filter = `${p}==*${searchParams[p]}*`;
        if (query.filter.reports) {
          query.filter.reports += `,`;
        } else {
          query.filter.reports += `(`;
        }
        query.filter.reports += `${filter}`;
      }
      query.filter.reports += ')';
    }

    if (author) {
      if (query.filter.reports) {
        query.filter.reports += ';';
      }
      query.filter.reports += `author==*${author}*`;
    }

    return query;
  }

  /**
   * @method search
   * @override
   * @param {Object} searchParams
   * @param {String} author
   * @returns {Promise} promise with search query results
   */
  search(searchParams, author) {
    return this.store.query('report', this.constructSearchQuery(searchParams, author));
  }
}
