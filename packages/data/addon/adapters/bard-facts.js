/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the bard-facts model.
 */

import $ from 'jquery';
import { deprecate } from '@ember/application/deprecations';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { A as array } from '@ember/array';
import { assign } from '@ember/polyfills';
import EmberObject, { getWithDefault, get } from '@ember/object';
import config from 'ember-get-config';
import { canonicalizeMetric, getAliasedMetrics, canonicalizeAlias } from '../utils/metric';
import fetch from 'fetch';
import { handleErrors } from 'navi-data/utils/errors';

const SORT_DIRECTIONS = ['desc', 'asc'];

const FACT_HOST = config.navi.dataSources[0].uri;

export default EmberObject.extend({
  /**
   * @property namespace
   */
  namespace: 'v1/data',

  /**
   * @property {Ember.Service} requestDecorator
   */
  requestDecorator: service(),

  /**
   * Builds the dimensions path for a request
   *
   * @method _buildDimensionsPath
   * @private
   * @param {Object} request
   * @return {String} dimensions path
   */
  _buildDimensionsPath(request /*options*/) {
    let dimensions = array(get(request, 'dimensions'));

    if (dimensions.length) {
      return `/${dimensions.mapBy('dimension').join('/')}`;
    } else {
      return '';
    }
  },

  /**
   * Builds a dateTime param string for a request
   *
   * @method _buildDateTimeParam
   * @private
   * @param {Object} request
   * @return {String} dateTime param value
   */
  _buildDateTimeParam(request) {
    let intervals = get(request, 'intervals');

    return intervals
      .map(interval => {
        return `${get(interval, 'start')}/${get(interval, 'end')}`;
      })
      .join(',');
  },

  /**
   * Builds a metrics param string for a request
   *
   * @method _buildMetricsParam
   * @private
   * @param {Object} request
   * @return {String} metrics param value
   */
  _buildMetricsParam(request) {
    return array(get(request, 'metrics'))
      .map(canonicalizeMetric)
      .join(',');
  },

  /**
   * Builds a filters param string for a request
   *
   * @method _buildFiltersParam
   * @private
   * @param {Object} request
   * @return {String} filters param value
   */
  _buildFiltersParam(request) {
    let filters = get(request, 'filters');

    if (filters && filters.length) {
      return filters
        .map(filter => {
          let dimension = get(filter, 'dimension'),
            operator = get(filter, 'operator'),
            values = get(filter, 'values').join(','),
            field = get(filter, 'field') || 'id';
          return `${dimension}|${field}-${operator}[${values}]`;
        })
        .join(',');
    } else {
      return undefined;
    }
  },

  /**
   * Builds a sort param string for a request
   *
   * @method _buildSortParam
   * @private
   * @param {Object} request
   * @param {function} aliasFunction function that returns metrics from aliases
   * @return {String} sort param value
   */
  _buildSortParam(request, aliasFunction = a => a) {
    let sort = get(request, 'sort');

    if (sort && sort.length) {
      return sort
        .map(sortMetric => {
          let metric = aliasFunction(get(sortMetric, 'metric')),
            direction = getWithDefault(sortMetric, 'direction', 'desc');

          assert(
            `'${direction}' is not a valid sort direction (${SORT_DIRECTIONS.join()})`,
            SORT_DIRECTIONS.indexOf(direction) !== -1
          );

          return `${metric}|${direction}`;
        })
        .join(',');
    } else {
      return undefined;
    }
  },

  /**
   * Builds a having param string for a request
   *
   * @method _buildHavingParam
   * @private
   * @param {Object} request
   * @param {function} aliasFunction function that returns metrics from aliases
   * @return {String} having param value
   */
  _buildHavingParam(request, aliasFunction = a => a) {
    let having = get(request, 'having');

    if (having && having.length) {
      return having
        .map(having => {
          deprecate('Please use the property `values` instead of `value` in a `having` object', !having.value, {
            id: 'navi-data._buildHavingParam',
            until: '4.0.0'
          });

          let metric = aliasFunction(get(having, 'metric')),
            operator = get(having, 'operator'),
            value = array([get(having, 'value')]), //value is deprecated
            values = array(get(having, 'values')),
            valuesStr = array(values.concat(value))
              .compact()
              .join(',');

          return `${metric}-${operator}[${valuesStr}]`;
        })
        .join(',');
    } else {
      return undefined;
    }
  },

  /**
   * Builds a URL path for a request
   *
   * @method _buildURLPath
   * @private
   * @param {Object} request
   * @return {String} URL Path
   */
  _buildURLPath(request, options) {
    let host = FACT_HOST,
      namespace = get(this, 'namespace'),
      table = get(request, 'logicalTable.table'),
      timeGrain = get(request, 'logicalTable.timeGrain'),
      dimensions = this._buildDimensionsPath(request, options);

    return `${host}/${namespace}/${table}/${timeGrain}${dimensions}/`;
  },

  /**
   * Builds a query object for a request
   *
   * @method _buildQuery
   * @private
   *
   * @param {Object} request
   * @param {Number} options.page - page number
   * @param {Number} options.perPage - number of results per page
   * @param {String} options.format - result format type
   * @param {Boolean} options.cache - with/without cache
   * @param {Object} options.queryParams - other params
   *
   * @return {Object} query object
   */
  _buildQuery(request, options) {
    let query = {},
      aliasMap = getAliasedMetrics(request.metrics),
      aliasFunction = alias => canonicalizeAlias(alias, aliasMap),
      filters = this._buildFiltersParam(request),
      having = this._buildHavingParam(request, aliasFunction),
      sort = this._buildSortParam(request, aliasFunction);

    query.dateTime = this._buildDateTimeParam(request);
    query.metrics = this._buildMetricsParam(request);

    if (filters) {
      query.filters = filters;
    }

    if (having) {
      query.having = having;
    }

    if (sort) {
      query.sort = sort;
    }

    //default format
    query.format = 'json';

    if (options) {
      if (options.page && options.perPage) {
        query.page = options.page;
        query.perPage = options.perPage;
      }

      if (options.format) {
        query.format = options.format;
      }

      if (options.cache === false) {
        query._cache = false;
      }

      //catch all query param and add to the query
      if (options.queryParams) {
        assign(query, options.queryParams);
      }
    }

    return query;
  },

  /**
   * Returns URL String for a request
   *
   * @method urlForFindQuery
   * @param {Object} request
   * @param {Object} [options] - options object
   * @return {String} url
   */
  urlForFindQuery(request, options) {
    // Decorate and translate the request
    let decoratedRequest = this._decorate(request),
      path = this._buildURLPath(decoratedRequest, options),
      query = this._buildQuery(decoratedRequest, options),
      queryStr = $.param(query);

    return `${path}?${queryStr}`;
  },

  /**
   * @method _decorate
   * @private
   * @param {Object} request - request to decorate
   * @returns {Object} decorated request
   */
  _decorate(request) {
    let decorator = get(this, 'requestDecorator');
    return decorator.applyGlobalDecorators(request);
  },

  /**
   * @method fetchDataForRequest - Uses the url generated using the adapter to make a fetch request
   * @param {Object} request - request object
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200,
   *        clientId: 'custom id',
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  fetchDataForRequest(request, options) {
    // Decorate and translate the request
    let decoratedRequest = this._decorate(request),
      url = new URL(this._buildURLPath(decoratedRequest, options)),
      query = this._buildQuery(decoratedRequest, options),
      clientId = 'UI',
      customHeaders = {},
      timeout = 300000;

    // Support custom clientid header
    if (options && options.clientId) {
      clientId = options.clientId;
    }

    // Support custom timeout
    if (options && options.timeout) {
      timeout = options.timeout;
    }

    // Support custom headers
    if (options && options.customHeaders) {
      customHeaders = options.customHeaders;
    }

    Object.entries(query).forEach(pair => url.searchParams.append(...pair));

    let headers = Object.assign(customHeaders, { clientid: clientId });

    return fetch(url, {
      credentials: 'include',
      headers,
      timeout
    })
      .then(handleErrors)
      .then(res => res.json());
  }
});
