/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for reports stored in the persistence layer.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from '../navi-base-search-provider';

export default class NaviReportSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property {Ember.Service} store
   */
  @service store;

  /**
   * @property {Ember.Service} user
   */
  @service user;

  /**
   * @property associatedComponent
   */
  associatedComponent = 'navi-report-search-result';

  /**
   * @method _parseQueryString
   * @private
   * @param {String} query
   * @returns {Object} query object
   */
  _parseQueryString(query) {
    let author;
    if (query) {
      author = this.user.getUser().id;
    }
    return { searchParams: { title: query, request: query }, author: author };
  }

  /**
   * @method _constructSearchQuery
   * @private
   * @param {Object} searchParams
   * @param {String} author
   * @returns {Object} search query object
   */
  _constructSearchQuery(searchParams, author) {
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
   * @param {String} query
   * @param {String} author
   * @returns {Promise} promise with search query results
   */
  search(query) {
    const parsedQuery = this._parseQueryString(query);
    return this.store.query('report', this._constructSearchQuery(parsedQuery.searchParams, parsedQuery.author));
  }
}
