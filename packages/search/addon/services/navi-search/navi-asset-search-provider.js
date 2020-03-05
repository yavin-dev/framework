/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for reports and dashboards stored in the persistence layer.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from '../navi-base-search-provider';
import { keepLatestTask } from 'ember-concurrency-decorators';
import { pluralize } from 'ember-inflector';

export default class NaviAssetSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property {Ember.Service} store
   */
  @service store;

  /**
   * @property {Ember.Service} user
   */
  @service user;

  /**
   * @property {String} _displayComponentName
   * @private
   */
  _displayComponentName = 'navi-search-result/asset';

  /**
   * @method _parseQueryString – Parses string query to search parameters
   * @private
   * @param {String} query
   * @param {String} type
   * @returns {Object} query object
   */
  _parseQueryString(query, type) {
    let searchParams;

    if (typeof query == 'string' && query) {
      if (type === 'report') {
        searchParams = {
          title: query,
          request: query
        };
      } else if (type === 'dashboard') {
        searchParams = {
          title: query
        };
      }
    }

    return searchParams;
  }

  /**
   * @method _constructSearchQuery – Constructs the query filter parameters adhering to the RSQL standard
   * The query is built to return results from the specified author. The user's query is matched against multiple fields,
   * therefore an 'or' is used between the different parameters and finally there's an 'and' with the author.
   * @private
   * @param {String} userQuery
   * @param {String} author
   * @param {String} type
   * @returns {Object} search query object
   */
  _constructSearchQuery(userQuery, type) {
    const author = this.user.getUser().id;
    const searchParams = this._parseQueryString(userQuery, type);
    const pluralType = pluralize(type);
    let query = { filter: { [pluralType]: '' } };

    let paramsFilterString = '';
    if (searchParams) {
      const paramsFilter = Object.keys(searchParams)
        .map(p => `${p}==*${searchParams[p]}*`)
        .join(','); // comma separated list of param filters
      paramsFilterString = paramsFilter ? `(${paramsFilter})` : ''; //wrap in parentheses if param filter present
    }

    let authorFilterString = '';
    if (author) {
      authorFilterString = paramsFilterString ? `;author==${author}` : `author==${author}`; //add semicolon if param filters present
    }

    query.filter[pluralType] = `${paramsFilterString}${authorFilterString}`;

    return query;
  }

  /**
   * @method search – Searches for reports and dashboards in the persistence layer
   * @override
   * @param {String} query
   * @yields {Promise} promise with search query results
   * @returns {Object} Object containing component, title, and data to be displayed
   */
  @keepLatestTask
  *search(query) {
    const types = ['report', 'dashboard'];
    const promises = [];

    types.forEach(type => {
      promises.push(this.store.query(type, this._constructSearchQuery(query, type)));
    });

    const data = yield Promise.all(promises).then(function(values) {
      return values.flatMap(value => value.toArray());
    });
    return {
      component: this._displayComponentName,
      title: 'Reports & Dashboards',
      data
    };
  }
}
