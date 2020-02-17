/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for dashboards stored in the persistence layer.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from '../navi-base-search-provider';

export default class NaviDashboardSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property {Ember.Service} store
   */
  @service store;

  /**
   * @property {Ember.Service} user
   */
  @service user;

  /**
   * @property {String} displayComponentName
   */
  displayComponentName = 'navi-search-result/report';

  /**
   * @method _parseQueryString
   * @private
   * @param {String} query
   * @param {String} type
   * @returns {Object} query object
   * @description Parses string query to search parameters
   */
  _parseQueryString(query) {
    let author = this.user.getUser().id;
    let parsedQuery = { searchParams: null, author: author };

    if (typeof query == 'string' && query) {
      parsedQuery.searchParams = {
        title: query
      };
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
  _constructSearchQuery(searchParams, author) {
    let query = { filter: { dashboards: '' } };

    if (searchParams) {
      for (let p in searchParams) {
        let filter = `${p}==*${searchParams[p]}*`;
        if (query.filter.dashboards) {
          query.filter.dashboards += `,`;
        } else {
          query.filter.dashboards += `(`;
        }
        query.filter.dashboards += `${filter}`;
      }
      query.filter.dashboards += ')';
    }

    if (author) {
      if (query.filter.dashboards) {
        query.filter.dashboards += ';';
      }
      query.filter.dashboards += `author==*${author}*`;
    }

    return query;
  }

  /**
   * @method search
   * @override
   * @param {String} query
   * @returns {Promise} promise with search query results
   * @description Searches for dashboards in the persistence layer
   */
  search(query) {
    const dashboardParsedQuery = this._parseQueryString(query);
    const dashboardResult = this.store.query(
      'dashboard',
      this._constructSearchQuery(dashboardParsedQuery.searchParams, dashboardParsedQuery.author)
    );
    return dashboardResult;
  }
}
