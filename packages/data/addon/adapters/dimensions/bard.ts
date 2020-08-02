/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the Bard dimension model.
 */

import { assert, warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import { configHost, getDefaultDataSourceName } from '../../utils/adapter';
import { serializeFilters } from '../facts/bard';
import { Filter } from '../facts/interface';
import { DimensionMetadata } from 'navi-data/models/metadata/dimension';

const SUPPORTED_FILTER_OPERATORS = ['in', 'notin', 'startswith', 'contains'];

/**
 * @enum {String} - mapping of dimension field names to URL dimension field names
 */
const URL_FIELD_NAMES: Dict<string> = {
  description: 'desc'
};

const SEARCH_TIMEOUT = 30000;

const CLIENT_ID = 'UI';

type DimensionFilter = {
  field: string;
  operator: string;
  values: string[];
};

type AdapterOptions = {
  dataSourceName?: string;
  clientId?: string;
  timeout?: number;
  page?: number;
  perPage?: number;
};

export default class BardDimensionAdapter extends EmberObject {
  /**
   * @property namespace
   */
  namespace = 'v1';

  /**
   * @property {Service} ajax
   */
  @service ajax: TODO;

  /**
   * @property {Service} bard metadata
   */
  @service bardMetadata: TODO;

  /**
   * @property {Array} supportedFilterOperators - List of supported filter operations
   */
  supportedFilterOperators = SUPPORTED_FILTER_OPERATORS;

  /**
   * Returns metadata for dimensionName
   *
   * @method _getDimensionMetadata
   * @private
   * @param {String} dimensionName - name of dimension
   * @param {String} namespace - namespace of keg.
   * @returns {Object} metadata object
   */
  _getDimensionMetadata(dimensionName: string, namespace = getDefaultDataSourceName()): DimensionMetadata {
    return this.bardMetadata.getById('dimension', dimensionName, namespace);
  }

  /**
   * Builds the URL for dimension search
   * @method _buildUrl
   * @private
   * @param {String} dimension - dimension name
   * @param {String} path - url path
   * @param {Object} options - optional list of options passed ot the host.
   * @returns {String} dimension value URL string
   */
  _buildUrl(dimension: string, path = 'values', options: AdapterOptions = {}) {
    const host = configHost(options);
    const { namespace } = this;
    const urlId =
      getOwner(this)
        .lookup(`adapter:metadata/dimension`)
        ?.buildURLId(dimension) || dimension;

    return `${host}/${namespace}/dimensions/${urlId}/${path}/`;
  }

  /**
   * Builds a filters query string for dimension values request
   *
   * @method _buildFilterQuery
   * @private
   * @param {String} dimension
   * @param {Array<Query>} andQueries - filter query object
   * @param {String} query.field - field used to query
   * @param {String} query.operator - valid operators 'contains', 'in'
   * @param {Array<String|number>} query.values
   * @param {Object} options - adapter options
   * @returns {String} filter query string
   */
  _buildFilterQuery(dimension: string, andQueries: DimensionFilter[], options: AdapterOptions = {}) {
    const dimensionId =
      getOwner(this)
        .lookup(`adapter:metadata/dimension`)
        ?.buildURLId(dimension) || dimension;

    if (!Array.isArray(andQueries)) {
      warn('_buildFilterQuery() was not passed an array of AND queries, wrapping as single query array', {
        id: 'bard-_buildFilterQuery-query-as-array'
      });
      andQueries = [andQueries]; // if not array, wrap
    }

    const stringQueries: DimensionFilter[] = andQueries.filter(q => typeof q.values === 'string');
    if (stringQueries.length) {
      warn('_buildFilterQuery() was passed query.values as a string, falling back to splitting by commas', {
        id: 'bard-_buildFilterQuery-query-values-as-array'
      });
      stringQueries.forEach((query: TODO) => (query.values = query.values.split(',')));
    }
    assert(
      "Only 'Array' query values are currently supported in the Bard adapter",
      andQueries.every(q => Array.isArray(q.values))
    );

    const defaultDimensionField = this._getDimensionMetadata(
      dimension,
      options.dataSourceName || getDefaultDataSourceName()
    ).primaryKeyFieldName;

    const requestV2Filters: Filter[] = andQueries.map(query => {
      const field = query.field || defaultDimensionField;
      const fieldForUrl = URL_FIELD_NAMES[field] || field;
      return {
        type: 'dimension',
        field: dimensionId,
        parameters: {
          field: fieldForUrl
        },
        operator: query.operator || 'in',
        values: query.values || []
      };
    });

    return {
      filters: serializeFilters(requestV2Filters)
    };
  }

  /**
   * Builds a search query string for dimension /search request
   *
   * @method _buildSearchQuery
   * @private
   * @param {String} dimension
   * @param {{values: Array<String|number>}} andQueries - filter query object
   * @returns {String} filter query string
   */
  _buildSearchQuery(_dimension: string, query: { values: Array<string | number> | string }) {
    assert('You must pass a single search query', !Array.isArray(query));

    if (typeof query.values === 'string') {
      warn('_buildquery() was passed query.values as a string, must be an array', {
        id: 'bard-_buildquery-query-values-as-array'
      });
      query.values = query.values.split(' ');
    }
    assert("Only 'Array' query values are currently supported in Bard", Array.isArray(query.values));

    return {
      query: query.values.join(' ')
    };
  }

  /**
   * @method _find - makes an ajax request
   * @param {String} url
   * @param {Object} [data]
   * @param {Object} [options]
   *      Ex: {
   *        page: 1,
   *        perPage: 200,
   *        clientId: 'custom id',
   *        timeout: 10000,
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  _find(url: string, data: TODO, options: AdapterOptions) {
    let clientId = CLIENT_ID,
      timeout = SEARCH_TIMEOUT;

    if (options) {
      // Support custom clientid header
      if (options.clientId) {
        clientId = options.clientId;
      }

      // Support custom timeout
      if (options.timeout) {
        timeout = options.timeout;
      }

      // pagination
      if (options.page && options.perPage) {
        data.page = options.page;
        data.perPage = options.perPage;
      }
    }

    return this.ajax.request(url, {
      xhrFields: {
        withCredentials: true
      },
      beforeSend(xhr: TODO) {
        xhr.setRequestHeader('clientid', clientId);
      },
      crossDomain: true,
      data,
      timeout
    });
  }

  /**
   * @method all - Makes a request for all values for a given dimension
   * @param {String} dimension - dimension name
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200,
   *        clientId: 'custom id',
   *        timeout: 10000,
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  all(dimension: string, options: AdapterOptions) {
    return this.find(dimension, undefined, options);
  }

  /**
   * @method findById - Finds a dimension value object by its id
   * @param {String} dimension - dimension name
   * @param {String} value - the value to be looked up
   * @param {Object} [options] - options object
   * @returns {Promise} - Promise with the response
   */
  findById(dimension: string, value: string, options: AdapterOptions) {
    return this.find(dimension, [{ field: 'id', operator: 'in', values: [value] }], options);
  }

  /**
   * @method find - makes a request to /values api to find dimensions by query term
   * @param {String} dimension - dimension name
   * @param {Array<Query>} andQueries - the filter query object
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200,
   *        clientId: 'custom id',
   *        timeout: 10000,
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  find(dimension: string, andQueries: DimensionFilter[] | undefined, options: AdapterOptions) {
    let url = this._buildUrl(dimension, undefined, options),
      data = {};

    // If filter query is present, build query having the filter
    if (andQueries) {
      data = this._buildFilterQuery(dimension, andQueries, options);
    }

    return this._find(url, data, options);
  }

  /**
   * @method search - makes a request to /search api to find dimensions by query term
   * @param {String} dimension - dimension name
   * @param {Object} query - the filter query object
   * @param {Object} [options] - options object
   *      Ex: {
   *        page: 1,
   *        perPage: 200,
   *        clientId: 'custom id',
   *        timeout: 10000,
   *        ...
   *      }
   * @returns {Promise} - Promise with the response
   */
  search(dimension: string, query: DimensionFilter, options: AdapterOptions) {
    let url = this._buildUrl(dimension, 'search', options),
      data = {};

    if (query) {
      data = this._buildSearchQuery(dimension, query);
    }

    return this._find(url, data, options);
  }

  /**
   * Pushes an array of dimension records to the web service
   *
   * @method pushMany
   * @param {String} dimension - type name of the dimension
   * @param {Array} rawRecords - array of dimension objects
   * @param {Object} [options] - options object
   * @returns {Array} records that were pushed to the web service
   */
  pushMany(/* dimension, payload, options */) {
    assert('Operation not supported');
  }
}
