/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the bard-facts model.
 */

import Ember from 'ember';
import config from 'ember-get-config';
import { canonicalizeMetric, getAliasedMetrics, canonicalizeAlias } from '../utils/metric';

const { A:array, assign, get, getWithDefault } = Ember;

const SORT_DIRECTIONS = ['desc', 'asc'];

const FACT_HOST = config.navi.dataSources[0].uri;

export default Ember.Object.extend({

  /**
   * @property namespace
   */
  namespace: 'v1/data',

  /**
   * @property {Service} ajax
   */
  ajax: Ember.inject.service(),

  /**
   * Builds the dimensions path for a request
   *
   * @method _buildDimensionsPath
   * @private
   * @param {Object} request
   * @return {String} dimensions path
   */
  _buildDimensionsPath(request) {
    let dimensions = array(get(request, 'dimensions'));

    if(dimensions.length) {
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

    return intervals.map(interval => {
      return `${get(interval, 'start')}/${get(interval, 'end')}`;
    }).join(',');

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
    return array(get(request, 'metrics')).map(canonicalizeMetric).join(',');
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

    if(filters && filters.length) {
      return filters.map(filter => {
        let dimension = get(filter, 'dimension'),
            operator  = get(filter, 'operator'),
            values    = get(filter, 'values').join(','),
            field     = get(filter, 'field') || 'id';
        return `${dimension}|${field}-${operator}[${values}]`;
      }).join(',');
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
  _buildSortParam(request, aliasFunction = (a) => a) {
    let sort = get(request, 'sort');

    if(sort && sort.length) {
      return sort.map(sortMetric => {
        let metric     = aliasFunction(get(sortMetric, 'metric')),
            direction  = getWithDefault(sortMetric, 'direction', 'desc');

        Ember.assert(`'${direction}' is not a valid sort direction (${SORT_DIRECTIONS.join()})`,
          SORT_DIRECTIONS.indexOf(direction) !== -1);

        return `${metric}|${direction}`;
      }).join(',');
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
  _buildHavingParam(request, aliasFunction = (a) => a) {
    let having = get(request, 'having');

    if(having && having.length) {
      return having.map(having => {

        Ember.deprecate('Please use the property `values` instead of `value` in a `having` object', !having.value, {
          id: 'navi-data._buildHavingParam',
          until: '4.0.0'
        });

        let metric = aliasFunction(get(having, 'metric')),
            operator  = get(having, 'operator'),
            value     = array([get(having, 'value')]), //value is deprecated
            values    = array(get(having, 'values')),
            valuesStr = array(values.concat(value)).compact().join(',');

        return `${metric}-${operator}[${valuesStr}]`;
      }).join(',');
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
  _buildURLPath(request) {
    let host       = FACT_HOST,
        namespace  = get(this, 'namespace'),
        table      = get(request, 'logicalTable.table'),
        timeGrain  = get(request, 'logicalTable.timeGrain'),
        dimensions = this._buildDimensionsPath(request);

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
    let query   = {},
        aliasMap = getAliasedMetrics(request.metrics),
        //TODO remove 'alias.metric || alias' -> alias when full serializer is in place
        aliasFunction = (alias) => canonicalizeAlias(alias.metric || alias, aliasMap),
        filters = this._buildFiltersParam(request),
        having = this._buildHavingParam(request, aliasFunction),
        sort = this._buildSortParam(request, aliasFunction);

    query.dateTime  = this._buildDateTimeParam(request);
    query.metrics   = this._buildMetricsParam(request);

    if(filters) {
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

    if(options) {
      if(options.page && options.perPage) {
        query.page = options.page;
        query.perPage = options.perPage;
      }

      if(options.format) {
        query.format = options.format;
      }

      if(options.cache === false) {
        query._cache = false;
      }

      //catch all query param and add to the query
      if(options.queryParams){
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
    let decoratedRequest  = this._decorate(request),
        path              = this._buildURLPath(decoratedRequest),
        query             = this._buildQuery(decoratedRequest, options),
        queryStr          = Ember.$.param(query);

    return `${path}?${queryStr}`;
  },
  /**
   * @property {Ember.Service} requestDecorator
   */
  requestDecorator: Ember.inject.service(),

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
   * @method fetchDataForRequest - Uses the url generated using the adapter to make an ajax request
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
  fetchDataForRequest(request, options){

    // Decorate and translate the request
    let decoratedRequest  = this._decorate(request),
        url               = this._buildURLPath(decoratedRequest),
        query             = this._buildQuery(decoratedRequest, options),
        clientId          = 'UI',
        customHeaders     = {},
        timeout           = 300000;

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

    return get(this, 'ajax').request(url, {
      xhrFields: {
        withCredentials: true
      },
      beforeSend(xhr) {
        xhr.setRequestHeader('clientid', clientId);
        Object.keys(customHeaders).forEach(name => xhr.setRequestHeader(name, customHeaders[name]));
      },
      crossDomain: true,
      data: query,
      timeout: timeout
    });
  }
});
