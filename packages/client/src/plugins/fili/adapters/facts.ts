/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */

import { canonicalizeColumn } from '../../../utils/column.js';
import NaviFactAdapter, { FactAdapterError } from '../../../adapters/facts/interface.js';
import { RequestV2, SORT_DIRECTIONS } from '../../../request.js';
import omit from 'lodash/omit.js';
import capitalize from 'lodash/capitalize.js';
import { getPeriodForGrain, Grain } from '../../../utils/date.js';
import moment from 'moment';
import Interval from '../../../utils/classes/interval.js';
import { ClientConfig, FiliDataSource } from '../../../config/datasources.js';
import type { RequestOptions, AsyncQueryResponse } from '../../../adapters/facts/interface.js';
import type { Request, Filter, Column, Sort, ParameterValue } from '../../../request.js';
import type BardTableMetadataModel from '../../../models/metadata/bard/table.js';
import NativeWithCreate, { ClientService, Config, Logger } from '../../../models/native-with-create.js';
import invariant from 'tiny-invariant';
import fetch from 'cross-fetch';
import mapValues from 'lodash/mapValues.js';
import { ensure, label, run } from 'effection';
import type { Operation } from 'effection';
import type MetadataService from '../../../services/interfaces/metadata.js';
import type RequestDecoratorService from '../../../services/interfaces/request-decorator.js';
import type { GrainWithAll } from '../serializers/metadata.js';
import type { Debugger } from 'debug';
import { FetchError } from '../../../errors/fetch-error.js';
// Node 14 support
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only.js';

export type Query = Record<string, string | number | boolean>;

/**
 * @param column - dimension column
 * @returns formatted dimension name
 */
function canonicalizeFiliDimension(column: Column | Filter | Sort): string {
  const ignoredParams = ['field'];
  if (column.type === 'timeDimension') {
    ignoredParams.push('grain');
  }
  const parameters = omit(column.parameters, ...ignoredParams);
  return canonicalizeColumn({ field: column.field, parameters });
}

export function buildTimeDimensionFilterValues(
  timeFilter: Filter,
  dataSourceConfig: FiliDataSource,
  allowCustomMacros: boolean,
  allowISOMacros: boolean,
  columnGrain?: GrainWithAll,
  dataEpoch?: string
): [string, string] | string[] {
  const filterGrain = timeFilter?.parameters?.grain as Grain;
  let start: string, end: string;
  if (timeFilter.operator === 'bet') {
    [start, end] = timeFilter.values as string[];
    if (allowCustomMacros) {
      if (columnGrain === 'all') {
        const grainSuffix = capitalize(getPeriodForGrain(filterGrain));
        if (start === 'current') {
          start += grainSuffix;
        }
        if (['current', 'next'].includes(end)) {
          end += grainSuffix;
        }
      }
      // Add 1 period to convert [inclusive, inclusive] to [inclusive, exclusive) format
      const endMoment = end ? moment.utc(end) : undefined;
      if (endMoment?.isValid()) {
        end = endMoment.add(1, getPeriodForGrain(filterGrain)).toISOString();
      }
    } else {
      const interval = Interval.parseInclusive(start, end, filterGrain).asMomentsForTimePeriod(filterGrain);
      // Don't overwrite durations
      if (!(allowISOMacros && start.startsWith('P'))) {
        start = interval.start.toISOString();
      }
      end = interval.end.toISOString();
    }
  } else if (timeFilter.operator === 'gte') {
    [start] = timeFilter.values as string[];
    if (!moment.utc(start).isValid()) {
      throw new FactAdapterError(`Since operator only supports datetimes, '${start}' is invalid`);
    }
    const sinceOperatorEnd = dataSourceConfig.options?.sinceOperatorEndPeriod;
    end = sinceOperatorEnd
      ? moment
          .utc()
          .add(moment.duration(sinceOperatorEnd))
          .add(1, filterGrain === 'isoWeek' ? 'week' : filterGrain)
          .startOf(filterGrain)
          .toISOString()
      : moment.utc('9999-12-31').startOf(filterGrain).toISOString();
  } else if (timeFilter.operator === 'lte') {
    start = moment
      .utc(dataEpoch || '0001-01-01')
      .startOf(filterGrain)
      .toISOString();
    [end] = timeFilter.values as string[];
    if (!moment.utc(end).isValid()) {
      throw new FactAdapterError(`Before operator only supports datetimes, '${end}' is invalid`);
    }
  } else if (timeFilter.operator === 'intervals') {
    return timeFilter.values as string[];
  } else if (timeFilter.operator === 'eq') {
    start = timeFilter.values[0] as string;
    end = moment.utc(start).add(1, getPeriodForGrain(filterGrain)).startOf(filterGrain).toISOString();
  } else {
    invariant(false, `Time Dimension filter operator ${timeFilter.operator} is not supported`);
  }

  // Removing Z to strip off time zone if it's there
  start = start.replace('Z', '');
  end = end.replace('Z', '');
  return [start, end];
}

/**
 * Serializes a list of filters to a fili filter string
 * @param filters - list of filters to be ANDed together for fili
 * @returns serialized filter string
 */
export function serializeFilters(filters: Filter[], dataSourceConfig: FiliDataSource, dataEpoch?: string): string {
  return filters
    .map((filter) => {
      let { operator, values, type } = filter;

      let serializedValues;
      if (type === 'timeDimension') {
        const filterValues = buildTimeDimensionFilterValues(
          filter,
          dataSourceConfig,
          false,
          false,
          undefined,
          dataEpoch
        );

        if (operator === 'lte') {
          serializedValues = [filterValues[1]];
        } else if (operator === 'gte') {
          serializedValues = [filterValues[0]];
        } else if (operator === 'intervals') {
          serializedValues = filterValues;
        } else {
          serializedValues = [filterValues[0], filterValues[1]];
        }
        if (filter.parameters.grain === 'day') {
          serializedValues = serializedValues.map((t) => moment.utc(t).format('YYYY-MM-DD'));
        } else if (filter.parameters.grain === 'second') {
          serializedValues = serializedValues.map((t) => moment.utc(t).format('YYYY-MM-DD HH:mm:ss'));
        }
      } else {
        serializedValues = values.map((v) => String(v).replace(/"/g, '""')); // csv serialize " -> ""
      }
      serializedValues = serializedValues
        .map((v) => `"${v}"`) // wrap each "value"
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

const PLUGIN_NAMESPACE = 'plugins:fili:facts:adapter';

export default class FiliFactsAdapter extends NativeWithCreate implements NaviFactAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1/data';

  @ClientService('navi-metadata')
  declare naviMetadata: MetadataService;

  @ClientService('request-decorator')
  declare requestDecorator: RequestDecoratorService;

  @Config('client')
  declare config: ClientConfig;

  @Logger(PLUGIN_NAMESPACE)
  declare LOG: Debugger;

  /**
   * Builds the dimensions path for a request
   */
  _buildDimensionsPath(request: Request /*options*/): string {
    const dimensionToFields = request.columns
      .filter((c) => c.type === 'dimension' || (c.type === 'timeDimension' && !isDateTime(c)))
      .reduce((dimensionToFields: Record<string, ParameterValue[]>, dim) => {
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
          .map((dim) => {
            const fields = [...new Set(dimensionToFields[dim])].filter((field) => !!field);
            return `${dim}${fields.length > 0 ? `;show=${fields.join(',')}` : ''}`;
          })
          .join('/')}`
      : '';
  }

  /**
   * Builds a dateTime param string for a request
   */
  _buildDateTimeParam(request: Request): string {
    const dateTimeFilters = request.filters.filter(isDateTime);
    if (dateTimeFilters.length !== 1) {
      throw new FactAdapterError(
        `Exactly one '${request.table}.dateTime' filter is required, you have ${dateTimeFilters.length}`
      );
    }
    const timeFilter = dateTimeFilters[0];
    const timeColumn = request.columns.filter(isDateTime)[0];
    const columnGrain: GrainWithAll = (timeColumn?.parameters?.grain as Grain | undefined) ?? 'all';
    const dataSourceConfig = this.config.getDataSource<'bard'>(request.dataSource);
    const filterValues = buildTimeDimensionFilterValues(
      timeFilter,
      dataSourceConfig,
      true,
      true,
      columnGrain,
      this.config.dataEpoch
    );
    if (timeFilter.operator === 'intervals') {
      return filterValues.join(',');
    }

    return `${filterValues[0]}/${filterValues[1]}`;
  }

  /**
   * Builds a metrics param string for a request
   */
  _buildMetricsParam(request: Request): string {
    const metrics = request.columns.filter((col) => col.type === 'metric');
    const metricIds = metrics.map((metric) => canonicalizeColumn(metric));

    return [...new Set(metricIds)].join(',');
  }

  /**
   * Builds a filters param string for a request
   */
  _buildFiltersParam(request: Request): string | undefined {
    const filters = request.filters
      .filter((fil) => fil.type === 'dimension' || (fil.type === 'timeDimension' && !isDateTime(fil)))
      .filter((fil) => fil.values.length !== 0);

    if (filters?.length) {
      const dataSourceConfig = this.config.getDataSource<'bard'>(request.dataSource);
      return serializeFilters(filters, dataSourceConfig);
    }
    return undefined;
  }

  /**
   * Builds a sort param string for a request
   */
  _buildSortParam(request: Request): string | undefined {
    const { sorts, table } = request;

    if (sorts.length) {
      let res = sorts.map(({ direction, field, parameters }) => {
        const canonicalName = field === `${table}.dateTime` ? 'dateTime' : canonicalizeColumn({ field, parameters });
        direction = direction || 'desc';

        invariant(
          SORT_DIRECTIONS.includes(direction),
          `'${direction}' must be a valid sort direction (${SORT_DIRECTIONS.join()})`
        );

        return `${canonicalName}|${direction}`;
      });

      // if dateTime is sorted, Fili requires it be the first sort
      const dateTimeIndex = res.findIndex((s) => s.match(/dateTime/));
      if (dateTimeIndex > -1) {
        const dateTimeSort = res[dateTimeIndex];
        res.splice(dateTimeIndex, 1);
        res.unshift(dateTimeSort);
      }

      return res.join(',');
    }
    return undefined;
  }

  /**
   * Builds a having param string for a request
   */
  _buildHavingParam(request: Request): string | undefined {
    const having = request.filters.filter((fil) => fil.type === 'metric' && fil.values.length !== 0);

    if (having?.length) {
      return having
        .map((having) => {
          const { field, parameters, operator, values = [] } = having;
          return `${canonicalizeColumn({ field, parameters })}-${operator}[${values.join(',')}]`;
        })
        .join(',');
    }
    return undefined;
  }

  /**
   * Builds rollup query params
   * @param {Request} request
   * @return {String}
   */
  _buildRollupParam(request: Request): string {
    const columns = request.columns;
    const rollupColumnCids = request.rollup?.columnCids || [];
    return [
      ...columns.reduce((colSet, requestColumn) => {
        if (rollupColumnCids.includes(requestColumn.cid ?? '')) {
          colSet.add(requestColumn && isDateTime(requestColumn) ? 'dateTime' : requestColumn?.field);
        }
        return colSet;
      }, new Set()),
    ].join(',');
  }

  /**
   * Builds a URL path for a request
   */
  _buildURLPath(request: Request, options: RequestOptions = {}): string {
    const host = this.config.configHost(options);
    const { namespace } = this;
    const table = request.table;

    const dateTimeColumns = request.columns.filter(isDateTime);
    const grains = [...new Set(dateTimeColumns.map((c) => c.parameters.grain))] as Grain[];
    if (grains.length > 1) {
      throw new FactAdapterError(
        `Requesting multiple 'Date Time' grains is not supported. You requested [${grains.join(',')}]`
      );
    }
    let timeGrain: GrainWithAll = grains.length === 1 ? grains[0] : 'all';
    timeGrain = 'isoWeek' === timeGrain ? 'week' : timeGrain;
    let dimensions = this._buildDimensionsPath(request);

    if ((request.rollup?.columnCids?.length ?? -1) > 0 || request?.rollup?.grandTotal) {
      dimensions = `${dimensions}/__rollupMask`;
    }

    const tableMeta = this.naviMetadata.getById('table', table, request.dataSource) as
      | BardTableMetadataModel
      | undefined;
    if (timeGrain === 'all' && tableMeta?.hasAllGrain === false) {
      throw new FactAdapterError(`Table '${table}' requires requesting 'Date Time' column exactly once.`);
    }

    return `${host}/${namespace}/${table}/${timeGrain}${dimensions}/`;
  }

  private _buildPagination(request: Request, options: RequestOptions = {}) {
    // Fili does not have a `LIMIT` concept, so map limit value to pagination concepts
    let pagination: { page: number; perPage: number } | undefined;
    const page = options.page ?? 1;

    if (request.limit && options.perPage) {
      if (request.limit <= options.perPage) {
        pagination = {
          page: 1,
          perPage: request.limit,
        };
      } else {
        pagination = {
          page,
          perPage: options.perPage,
        };
      }
    } else if (options.perPage) {
      pagination = {
        page,
        perPage: options.perPage,
      };
    } else if (request.limit) {
      pagination = {
        page,
        perPage: request.limit,
      };
    }
    return pagination;
  }

  /**
   * Builds a query object for a request
   */
  _buildQuery(request: Request, options: RequestOptions = {}): Query {
    const filters = this._buildFiltersParam(request);
    const having = this._buildHavingParam(request);
    const sort = this._buildSortParam(request);
    const rollupTo = this._buildRollupParam(request);
    const pagination = this._buildPagination(request, options) ?? {};

    const query: Query = {
      dateTime: this._buildDateTimeParam(request),
      metrics: this._buildMetricsParam(request),
      ...(filters ? { filters } : {}),
      ...(having ? { having } : {}),
      ...(sort ? { sort } : {}),
      ...(rollupTo ? { rollupTo } : {}),
      ...(request.rollup?.grandTotal === true ? { rollupGrandTotal: true } : {}),
      format: options?.format ?? 'json',
      ...(options?.fileName ? { filename: options.fileName } : {}),
      ...pagination,
    };

    const { cache, queryParams } = options;

    if (cache === false) {
      query._cache = false;
    }

    //catch all query param and add to the query
    if (queryParams) {
      Object.assign(query, queryParams);
    }

    return query;
  }

  /**
   * Returns URL String for a request
   */
  urlForFindQuery(request: Request, options?: RequestOptions): string {
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
  urlForDownloadQuery(request: Request, options?: RequestOptions): Promise<string> {
    return Promise.resolve(this.urlForFindQuery(request, options));
  }

  /**
   * Decorates a requestV2 object
   */
  _decorate(request: Request): Request {
    return this.requestDecorator.applyGlobalDecorators(request);
  }

  fetchDataForRequest(request: RequestV2, options?: RequestOptions): Promise<unknown> {
    return run(this.fetchDataForRequestTask(request, options), {
      labels: { name: `${PLUGIN_NAMESPACE}:fetchDataForRequest` },
    });
  }

  /**
   * Uses the url generated using the adapter to make an ajax request
   */
  *fetchDataForRequestTask(request: Request, options?: RequestOptions): Operation<unknown> {
    invariant((request.requestVersion || '').startsWith('2.'), 'Fact request for fili adapter must be version 2');

    // Decorate and translate the request
    const decoratedRequest = this._decorate(request);
    const url = this._buildURLPath(decoratedRequest, options);
    const query = this._buildQuery(decoratedRequest, options);
    let clientId = 'UI';
    let customHeaders: Record<string, string> = {};
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

    const urlRequest = `${url}?${new URLSearchParams(mapValues(query, (val) => `${val}`)).toString()}`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    yield ensure(() => controller.abort());
    yield label({ state: 'fetching', url: urlRequest });
    this.LOG(`GET ${urlRequest}`);
    let response: Response = yield fetch(urlRequest, {
      credentials: 'include',
      headers: {
        clientid: clientId,
        ...customHeaders,
      },
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      this.LOG(`Error HTTP${response.status} while fetching ${urlRequest}`);
      yield label({ state: 'erroring', httpStatus: response.status });
      let payload: string;
      if (controller.signal.aborted) {
        payload = 'The fetch operation timed out';
      } else {
        payload = yield response.text();
        try {
          payload = JSON.parse(payload);
        } catch {
          // nothing to do
        }
      }
      throw new FetchError(urlRequest, response.status, payload);
    }
    return yield response.json();
  }

  asyncFetchDataForRequest(_request: Request, _options: RequestOptions): Promise<AsyncQueryResponse> {
    throw new FactAdapterError('Method not implemented.');
  }
}
