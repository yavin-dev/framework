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
import { canonicalizeMetric } from '../../utils/metric';
import { configHost } from '../../utils/adapter';
import NaviFactAdapter, {
  Filter,
  RequestOptions,
  RequestV2,
  SORT_DIRECTIONS,
  AsyncQueryResponse,
  Column,
  Sort
} from './interface';
import { omit } from 'lodash-es';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import BardTableMetadataModel from 'navi-data/models/metadata/bard/table';
import { GrainWithAll } from 'navi-data/serializers/metadata/bard';
import { Grain } from 'navi-data/utils/date';

export type Query = RequestOptions & Dict<string | number | boolean>;
export class FactAdapterError extends Error {
  name = 'FactAdapterError';
}

/**
 * @param column - dimension column
 * @returns formatted dimension name
 */
function canonicalizeFiliDimension(column: Column | Filter | Sort): string {
  if (!column.parameters.field) {
    warn(`Dimension '${column.field}' does not specify a 'field' parameter`, {
      id: 'formatDimensionFieldName--no-field-paramter'
    });
  }
  if (column.field.includes('.')) {
    warn(`Dimension '${column.field}' includes '.', which is likely an error, use the parameters instead`, {
      id: 'formatDimensionFieldName--dimension-with-period'
    });
  }
  const parameters = omit(column.parameters, 'field');
  return canonicalizeMetric({ metric: column.field, parameters });
}

/**
 * Serializes a list of filters to a fili filter string
 * @param filters - list of filters to be ANDed together for fili
 * @returns serialized filter string
 */
export function serializeFilters(filters: Filter[]): string {
  return filters
    .map(filter => {
      let { operator, values } = filter;
      let serializedValues = values
        .map((v: string | number) => String(v).replace(/"/g, '""')) // csv serialize " -> ""
        .map(v => `"${v}"`) // wrap each "value"
        .join(','); // comma to separate

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

      const dimension = canonicalizeFiliDimension(filter);
      const dimensionField = filter.parameters.field || 'id';
      return `${dimension}|${dimensionField}-${operator}[${serializedValues}]`;
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

export type FilterOperator = 'in' | 'notin' | 'contains';
export type HavingOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'bet' | 'nbet';

export default class BardFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1/data';

  @service ajax: TODO;

  @service naviMetadata!: NaviMetadataService;

  /**
   * Builds the dimensions path for a request
   */
  _buildDimensionsPath(request: RequestV2 /*options*/): string {
    const dimensionToFields = request.columns
      .filter(c => c.type === 'dimension')
      .reduce((dimensionToFields: Record<string, string[]>, dim) => {
        const dimName = canonicalizeFiliDimension(dim);
        if (!dimensionToFields[dimName]) {
          dimensionToFields[dimName] = [];
        }
        dimensionToFields[dimName].push(dim.parameters.field);
        return dimensionToFields;
      }, {});

    const dimensions = Object.keys(dimensionToFields);
    return dimensions.length
      ? `/${dimensions
          .map(dim => {
            const fields = [...new Set(dimensionToFields[dim])].filter(field => !!field);
            return `${dim}${fields.length > 0 ? `;show=${fields.sort().join(',')}` : ''}`;
          })
          .join('/')}`
      : '';
  }

  /**
   * Builds a dateTime param string for a request
   */
  _buildDateTimeParam(request: RequestV2): string {
    const dateTimeFilters = request.filters.filter(isDateTime);
    if (dateTimeFilters.length !== 1) {
      throw new FactAdapterError(
        `Exactly one '${request.table}.dateTime' filter is required, you have ${dateTimeFilters.length}`
      );
    }
    const timeFilter = dateTimeFilters[0];
    const filterGrain = timeFilter?.parameters?.grain;

    const timeColumn = request.columns.filter(isDateTime)[0];
    const columnGrain = timeColumn?.parameters?.grain;
    if (timeColumn && columnGrain !== filterGrain) {
      throw new FactAdapterError(
        `The requested filter timeGrain '${filterGrain}', must match the column timeGrain '${columnGrain}'`
      );
    }

    const [start, end] = timeFilter.values;

    return `${start}/${end}`;
  }

  /**
   * Builds a metrics param string for a request
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
   */
  _buildURLPath(request: RequestV2, options: RequestOptions = {}): string {
    const host = configHost(options);
    const { namespace } = this;
    const table = request.table;

    const dateTimeColumns = request.columns.filter(isDateTime);
    const grains = [...new Set(dateTimeColumns.map(c => c.parameters.grain))] as Grain[];
    if (grains.length > 1) {
      throw new FactAdapterError(
        `Requesting more than one '${request.table}.dateTime' grain is not supported. You requested [${grains.join(
          ','
        )}]`
      );
    }
    let timeGrain: GrainWithAll = grains.length === 1 ? grains[0] : 'all';
    timeGrain = 'isoWeek' === timeGrain ? 'week' : timeGrain;
    const dimensions = this._buildDimensionsPath(request);

    const tableMeta = this.naviMetadata.getById('table', table, request.dataSource) as
      | BardTableMetadataModel
      | undefined;
    if (timeGrain === 'all' && tableMeta?.hasAllGrain === false) {
      throw new FactAdapterError(`Table '${table}' requires exactly 1 'Date Time' column, you have 0.`);
    }

    return `${host}/${namespace}/${table}/${timeGrain}${dimensions}/`;
  }

  /**
   * Builds a query object for a request
   */
  _buildQuery(request: RequestV2, options?: RequestOptions): Query {
    const filters = this._buildFiltersParam(request);
    const having = this._buildHavingParam(request);
    const sort = this._buildSortParam(request);

    const query: Query = {
      dateTime: this._buildDateTimeParam(request),
      metrics: this._buildMetricsParam(request),
      ...(filters ? { filters } : {}),
      ...(having ? { having } : {}),
      ...(sort ? { sort } : {}),
      format: options?.format ?? 'json'
    };

    const { page, perPage, cache, queryParams } = options || {};
    if (page && perPage) {
      query.page = page;
      query.perPage = perPage;
    }

    if (cache === false) {
      query._cache = false;
    }

    //catch all query param and add to the query
    if (queryParams) {
      assign(query, queryParams);
    }

    return query;
  }

  /**
   * Returns URL String for a request
   */
  urlForFindQuery(request: RequestV2, options?: RequestOptions): string {
    // Decorate and translate the request
    const decoratedRequest = this._decorate(request);
    const path = this._buildURLPath(decoratedRequest, options);
    const query = this._buildQuery(decoratedRequest, options);
    const queryStr = Object.entries(query)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${path}?${queryStr}`;
  }

  /**
   * Returns URL String for a request
   */
  async urlForDownloadQuery(request: RequestV2, options?: RequestOptions): Promise<string> {
    return this.urlForFindQuery(request, options);
  }
  /**
   * @property requestDecorator
   */
  @service requestDecorator: TODO;

  /**
   * Decorates a requestV2 object
   */
  _decorate(request: RequestV2): RequestV2 {
    return this.requestDecorator.applyGlobalDecorators(request);
  }

  /**
   * Uses the url generated using the adapter to make an ajax request
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
