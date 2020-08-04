/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The adapter for the bard-facts request v2 model.
 */

import { assert, warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { A as array } from '@ember/array';
import { assign } from '@ember/polyfills';
import EmberObject from '@ember/object';
import { canonicalizeMetric, serializeParameters, getAliasedMetrics, canonicalizeAlias } from '../../utils/metric';
import { configHost } from '../../utils/adapter';
import NaviFactAdapter, {
  Filter,
  Parameters,
  RequestOptions,
  RequestV2,
  SORT_DIRECTIONS,
  AsyncQueryResponse
} from './interface';
import { omit } from 'lodash-es';

export type Query = RequestOptions & Dict<string | number | boolean>;
export type AliasFn = (column: string) => string;

/**
 * @function formatDimensionFieldName
 * @param field - dimension id
 * @param parameters - parameters object
 * @param {boolean} includeFieldProj - whether to include the projected field in the formatted name e.g. age|id  OR  age
 * @returns formatted dimension name
 */
function formatDimensionFieldName(field: string, parameters: Parameters, includeFieldProj = true): string {
  assert(`the dimension ${field} specifies a field parameter`, parameters.field);
  if (field.includes('.')) {
    warn(`field '${field}' includes '.', which is likely an error, use the parameters instead`);
  }
  const restParams = omit(parameters, 'field');
  let parameterString = serializeParameters(restParams);

  if (parameterString.length > 0) {
    parameterString = `(${parameterString})`;
  }
  return `${field}${parameterString}${includeFieldProj ? `|${parameters.field}` : ''}`;
}

/**
 * Serializes a list of filters to a fili filter string
 * @param filters - list of filters to be ANDed together for fili
 * @returns serialized filter string
 */
export function serializeFilters(filters: Filter[]): string {
  return filters
    .map(filter => {
      const { field, operator, values, parameters } = filter;
      const serializedValues = values
        .map(v => String(v).replace(/"/g, '""')) // csv serialize " -> ""
        .map(v => `"${v}"`) // wrap each "value"
        .join(','); // comma to separate
      const formattedFieldName = formatDimensionFieldName(field, parameters, true);

      return `${formattedFieldName}-${operator}[${serializedValues}]`;
    })
    .join(',');
}

export default class BardFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1/data';

  /**
   * @property {Service} ajax
   */
  @service ajax: TODO;

  /**
   * Builds the dimensions path for a request
   *
   * @method _buildDimensionsPath
   * @private
   * @param request
   * @return dimensions path
   */
  _buildDimensionsPath(request: RequestV2 /*options*/): string {
    const dimensions = array(request.columns)
      .filterBy('type', 'dimension')
      .map(dim => formatDimensionFieldName(dim.field, dim.parameters, false));

    return dimensions.length
      ? `/${array(dimensions)
          .uniq()
          .join('/')}`
      : '';
  }

  /**
   * Builds a dateTime param string for a request
   *
   * @method _buildDateTimeParam
   * @private
   * @param request
   * @return dateTime param value
   */
  _buildDateTimeParam(request: RequestV2): string {
    const dateTimeFilters = request.filters.filter(fil => fil.field === 'dateTime');

    return dateTimeFilters.map(filter => `${filter.values[0]}/${filter.values[1]}`).join(',');
  }

  /**
   * Builds a metrics param string for a request
   *
   * @method _buildMetricsParam
   * @private
   * @param request
   * @return metrics param value
   */
  _buildMetricsParam(request: RequestV2): string {
    const metrics = request.columns.filter(col => col.type === 'metric');
    const metricIds = metrics.map(metric =>
      canonicalizeMetric({ metric: metric.field, parameters: metric.parameters })
    );

    return array(metricIds)
      .uniq()
      .join(',');
  }

  /**
   * Builds a filters param string for a request
   *
   * @method _buildFiltersParam
   * @private
   * @param request
   * @return filters param value
   */
  _buildFiltersParam(request: RequestV2): string | undefined {
    const filters = request.filters.filter((fil: Filter) => fil.type === 'dimension');

    if (filters?.length) {
      return serializeFilters(filters);
    }
    return undefined;
  }

  /**
   * Builds a sort param string for a request
   *
   * @method _buildSortParam
   * @private
   * @param request
   * @param aliasFunction function that returns metrics from aliases
   * @return sort param value
   */
  _buildSortParam(request: RequestV2, aliasFunction: AliasFn = a => a): string | undefined {
    const { sorts } = request;

    if (sorts.length) {
      return sorts
        .map(sortField => {
          const field = aliasFunction(sortField.field);
          const direction = sortField.direction || 'desc';

          assert(
            `'${direction}' must be a valid sort direction (${SORT_DIRECTIONS.join()})`,
            SORT_DIRECTIONS.includes(direction)
          );

          return `${field}|${direction}`;
        })
        .join(',');
    }
    return undefined;
  }

  /**
   * Builds a having param string for a request
   *
   * @method _buildHavingParam
   * @private
   * @param request
   * @param aliasFunction function that returns metrics from aliases
   * @return having param value
   */
  _buildHavingParam(request: RequestV2, aliasFunction: AliasFn = a => a): string | undefined {
    const having = request.filters.filter(fil => fil.type === 'metric');

    if (having?.length) {
      return having
        .map(having => {
          const { field, operator, values = [] } = having;

          return `${aliasFunction(field)}-${operator}[${values.join(',')}]`;
        })
        .join(',');
    }
    return undefined;
  }

  /**
   * Builds a URL path for a request
   *
   * @method _buildURLPath
   * @private
   * @param request
   * @param options - optional host options
   * @return URL Path
   */
  _buildURLPath(request: RequestV2, options: RequestOptions = {}): string {
    const host = configHost(options);
    const { namespace } = this;
    const table = request.table;
    const timeGrain = request.columns.find(col => col.field === 'dateTime')?.parameters?.grain || 'all';
    const dimensions = this._buildDimensionsPath(request);

    return `${host}/${namespace}/${table}/${timeGrain}${dimensions}/`;
  }

  /**
   * Builds a query object for a request
   *
   * @method _buildQuery
   * @private
   * @param request
   * @param options
   * @returns query object
   */
  _buildQuery(request: RequestV2, options: RequestOptions): Query {
    const { columns } = request;
    const metrics = columns
      .filter(col => col.type === 'metric')
      .map(col => ({ metric: col.field, parameters: col.parameters }));
    const aliasMap = getAliasedMetrics(metrics);
    const aliasFunction: AliasFn = alias => canonicalizeAlias(alias, aliasMap);
    const filters = this._buildFiltersParam(request);
    const having = this._buildHavingParam(request, aliasFunction);
    const sort = this._buildSortParam(request, aliasFunction);
    const query: Query = {
      dateTime: this._buildDateTimeParam(request),
      metrics: this._buildMetricsParam(request)
    };

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
  }

  /**
   * Returns URL String for a request
   *
   * @method urlForFindQuery
   * @param request
   * @param options
   * @return url
   */
  urlForFindQuery(request: RequestV2, options: RequestOptions): string {
    assert('Request for bard-facts adapter must be version 2', (request.requestVersion || '').startsWith('2.'));

    // Decorate and translate the request
    let decoratedRequest = this._decorate(request),
      path = this._buildURLPath(decoratedRequest, options),
      query = this._buildQuery(decoratedRequest, options),
      queryStr = Object.entries(query)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${path}?${queryStr}`;
  }

  /**
   * @property {Ember.Service} requestDecorator
   */
  @service requestDecorator: TODO;

  /**
   * @method _decorate
   * @private
   * @param request - request to decorate
   * @returns decorated request
   */
  _decorate(request: RequestV2): RequestV2 {
    return this.requestDecorator.applyGlobalDecorators(request);
  }

  /**
   * @method fetchDataForRequest - Uses the url generated using the adapter to make an ajax request
   * @param request - request (v2) object
   * @param options - options object
   * @returns {Promise} - Promise with the response
   */
  fetchDataForRequest(request: RequestV2, options: RequestOptions) {
    assert('Request for bard-facts adapter must be version 2', (request.requestVersion || '').startsWith('2.'));

    // Decorate and translate the request
    const decoratedRequest = this._decorate(request);
    const url = this._buildURLPath(decoratedRequest, options);
    const query = this._buildQuery(decoratedRequest, options);
    let clientId = 'UI';
    let customHeaders: Dict<string> = {};
    let timeout = 600000;

    // Support custom clientid header
    if (options?.clientId) {
      clientId = options.clientId;
    }

    // Support custom timeout
    if (options?.timeout) {
      timeout = options.timeout;
    }

    // Support custom headers
    if (options?.customHeaders) {
      customHeaders = options.customHeaders;
    }

    return this.ajax.request(url, {
      xhrFields: {
        withCredentials: true
      },
      beforeSend(xhr: TODO) {
        xhr.setRequestHeader('clientid', clientId);
        Object.keys(customHeaders).forEach(name => xhr.setRequestHeader(name, customHeaders[name]));
      },
      crossDomain: true,
      data: query,
      timeout: timeout
    });
  }

  asyncFetchDataForRequest(_request: RequestV2, _options: RequestOptions): Promise<AsyncQueryResponse> {
    throw new Error('Method not implemented.');
  }
}
