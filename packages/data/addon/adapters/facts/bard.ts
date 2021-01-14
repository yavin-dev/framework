/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */

import { assert, warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { A as array } from '@ember/array';
import { assign } from '@ember/polyfills';
import EmberObject from '@ember/object';
import { canonicalizeMetric, serializeParameters } from '../../utils/metric';
import { configHost } from '../../utils/adapter';
import NaviFactAdapter, {
  Filter,
  Parameters,
  RequestOptions,
  RequestV2,
  SORT_DIRECTIONS,
  AsyncQueryResponse,
  Column,
  Sort
} from './interface';
import { omit } from 'lodash-es';

export type Query = RequestOptions & Dict<string | number | boolean>;
export class FactAdapterError extends Error {
  name = 'FactAdapterError';
}

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
      let { field, operator, values, parameters } = filter;
      let serializedValues = values
        .map((v: string | number) => String(v).replace(/"/g, '""')) // csv serialize " -> ""
        .map(v => `"${v}"`) // wrap each "value"
        .join(','); // comma to separate
      const formattedFieldName = formatDimensionFieldName(field, parameters, true);
      if (operator === 'isnull') {
        if (values[0] === true) {
          operator = 'in';
        } else if (values[0] === false) {
          operator = 'notin';
        } else {
          throw new FactAdapterError(`isnull operator can only have boolean values, found: ${values[0]}`);
        }
        serializedValues = '""';

      }

      return `${formattedFieldName}-${operator}[${serializedValues}]`;
    })
    .join(',');
}

/**
 * Returns true if a column is a timeDimension and ends with `.dateTime`
 * @param column the column to check if it is a dateTime
 */
function isDateTime(column: Column | Filter | Sort) {
  return column.type === 'timeDimension' && column.field.endsWith('.dateTime');
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
    const dateTimeFilters = request.filters.filter(isDateTime);
    if (dateTimeFilters.length !== 1) {
      throw new FactAdapterError(
        `Exactly one '${request.table}.dateTime' filter is supported, you have ${dateTimeFilters.length}`
      );
    }
    const filter = dateTimeFilters[0];
    const dateTime = request.columns.filter(isDateTime)[0];
    const timeGrain = dateTime?.parameters?.grain || 'all';
    if (timeGrain !== filter.parameters.grain) {
      throw new FactAdapterError(
        `The requested filter timeGrain '${filter.parameters.grain}', must match the column timeGrain '${timeGrain}'`
      );
    }

    const [start, end] = filter.values;

    return `${start}/${end}`;
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
    const filters = request.filters.filter(fil => fil.type === 'dimension' && fil.values.length !== 0);

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
  _buildSortParam(request: RequestV2): string | undefined {
    const { sorts, table } = request;

    if (sorts.length) {
      return sorts
        .map(({ direction, field, parameters }) => {
          const canonicalName =
            field === `${table}.dateTime` ? 'dateTime' : canonicalizeMetric({ metric: field, parameters });
          direction = direction || 'desc';

          assert(
            `'${direction}' must be a valid sort direction (${SORT_DIRECTIONS.join()})`,
            SORT_DIRECTIONS.includes(direction)
          );

          return `${canonicalName}|${direction}`;
        })
        .join(',');
    }
    return undefined;
  }

  /**
   * Builds a having param string for a request
   *
   * @private
   * @param request
   * @return having param value
   */
  _buildHavingParam(request: RequestV2): string | undefined {
    const having = request.filters.filter(fil => fil.type === 'metric' && fil.values.length !== 0);

    if (having?.length) {
      return having
        .map(having => {
          const { field, operator, values = [] } = having;

          return `${field}-${operator}[${values.join(',')}]`;
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

    const dateTimeColumns = request.columns.filter(isDateTime);
    if (dateTimeColumns.length > 1) {
      throw new FactAdapterError(`Requsting more than one '${request.table}.dateTime' columns is not supported`);
    }
    let timeGrain = dateTimeColumns[0]?.parameters?.grain || 'all';
    timeGrain = 'isoWeek' === timeGrain ? 'week' : timeGrain;
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
  _buildQuery(request: RequestV2, options?: RequestOptions): Query {
    const filters = this._buildFiltersParam(request);
    const having = this._buildHavingParam(request);
    const sort = this._buildSortParam(request);
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
  urlForFindQuery(request: RequestV2, options?: RequestOptions): string {
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
   * Returns URL String for a request
   *
   * @method urlForDownloadQuery
   * @param request
   * @param options
   * @return url
   */
  async urlForDownloadQuery(request: RequestV2, options?: RequestOptions): Promise<string> {
    return this.urlForFindQuery(request, options);
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
  fetchDataForRequest(request: RequestV2, options?: RequestOptions): Promise<unknown> {
    assert('Fact request for fili adapter must be version 2', (request.requestVersion || '').startsWith('2.'));

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
    throw new FactAdapterError('Method not implemented.');
  }
}
