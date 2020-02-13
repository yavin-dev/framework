/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for reports and dashboards stored in the persistence layer.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from './navi-base-search-provider';

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
   * @method _parseReportString
   * @private
   * @param {String} query
   * @param {String} type
   * @returns {Object} query object
   * @description Parses string query to search parameters
   */
  _parseQueryString(query, type) {
    let author = this.user.getUser().id;
    let parsedQuery = { searchParams: null, author: author };

    if (typeof query == 'string' && query) {
      if (type === 'report') {
        parsedQuery.searchParams = {
          title: query,
          request: query
        };
      } else if (type === 'dashboard') {
        parsedQuery.searchParams = {
          title: query
        };
      }
    }

    return parsedQuery;
  }

  /**
   * @method _constructSearchQuery
   * @private
   * @param {Object} searchParams
   * @param {String} author
   * @returns {Object} search query object
   * @description Constructs the query filter parameters adhering to the RSQL standard
   */
  _constructSearchQuery(searchParams, author, type) {
    let query = { filter: { [type]: '' } };

    if (searchParams) {
      for (let p in searchParams) {
        let filter = `${p}==*${searchParams[p]}*`;
        if (query.filter[type]) {
          query.filter[type] += `,`;
        } else {
          query.filter[type] += `(`;
        }
        query.filter[type] += `${filter}`;
      }
      query.filter[type] += ')';
    }

    if (author) {
      if (query.filter[type]) {
        query.filter[type] += ';';
      }
      query.filter[type] += `author==*${author}*`;
    }

    return query;
  }

  /**
   * @method search
   * @override
   * @param {String} query
   * @returns {Promise} promise with search query results
   * @description Searches for reports and dashboards in the persistence layer
   */
  search(query) {
    const reportParsedQuery = this._parseQueryString(query, 'report');
    const dashboardParsedQuery = this._parseQueryString(query, 'dashboard');
    const reportResult = this.store.query(
      'report',
      this._constructSearchQuery(reportParsedQuery.searchParams, reportParsedQuery.author, 'reports')
    );
    const dashboardResult = this.store.query(
      'dashboard',
      this._constructSearchQuery(dashboardParsedQuery.searchParams, dashboardParsedQuery.author, 'dashboards')
    );
    return { reports: reportResult, dashboards: dashboardResult };
  }
}
