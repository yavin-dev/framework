/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Description: The fact adapter for the bard request v2 model.
 */

import { assert, warn } from '@ember/debug';
import { inject as service } from '@ember/service';
import { A as array } from '@ember/array';
import EmberObject from '@ember/object';
import { canonicalizeMetric } from '../../utils/metric';
import { configHost, getDataSource } from '../../utils/adapter';
import NaviFactAdapter, {
  Filter,
  RequestOptions,
  RequestV2,
  SORT_DIRECTIONS,
  AsyncQueryResponse,
  Column,
  Sort,
  FactAdapterError,
} from './interface';
import { omit } from 'lodash-es';
import { getPeriodForGrain, Grain } from 'navi-data/utils/date';
import moment from 'moment';
import config from 'ember-get-config';
import { task } from 'ember-concurrency';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type RequestDecoratorService from 'navi-data/services/request-decorator';
import type BardTableMetadataModel from 'navi-data/models/metadata/bard/table';
import type { GrainWithAll } from 'navi-data/serializers/metadata/bard';
import type { TaskGenerator } from 'ember-concurrency';
import Interval from 'navi-data/utils/classes/interval';
import { FiliDataSource } from 'navi-config';

export type Query = Record<string, string | number | boolean>;

/**
 * @param column - dimension column
 * @returns formatted dimension name
 */
function canonicalizeFiliDimension(column: Column | Filter | Sort): string {
  if (!column.parameters.field) {
    warn(`Dimension '${column.field}' does not specify a 'field' parameter`, {
      id: 'formatDimensionFieldName--no-field-paramter',
    });
  }
  if (column.field.includes('.')) {
    warn(`Dimension '${column.field}' includes '.', which is likely an error, use the parameters instead`, {
      id: 'formatDimensionFieldName--dimension-with-period',
    });
  }
  const ignoredParams = ['field'];
  if (column.type === 'timeDimension') {
    ignoredParams.push('grain');
  }
  const parameters = omit(column.parameters, ...ignoredParams);
  return canonicalizeMetric({ metric: column.field, parameters });
}

export function buildTimeDimensionFilterValues(
  timeFilter: Filter,
  dataSource: string,
  allowCustomMacros: boolean,
  allowISOMacros: boolean
): [string, string] | string[] {
  const filterGrain = timeFilter?.parameters?.grain as Grain;
  let start: string, end: string;
  if (timeFilter.operator === 'bet') {
    [start, end] = timeFilter.values as string[];
    if (allowCustomMacros) {
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
    const dataSourceConfig = getDataSource(dataSource) as FiliDataSource;
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
      .utc(config.navi.dataEpoch || '0001-01-01')
      .startOf(filterGrain)
      .toISOString();
    [end] = timeFilter.values as string[];
    if (!moment.utc(end).isValid()) {
      throw new FactAdapterError(`Before operator only supports datetimes, '${end}' is invalid`);
    }
  } else if (timeFilter.operator === 'intervals') {
    return timeFilter.values as string[];
  } else {
    assert(`Time Dimension filter operator ${timeFilter.operator} is not supported`);
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
export function serializeFilters(filters: Filter[], dataSource: string): string {
  return filters
    .map((filter) => {
      let { operator, values, type } = filter;

      let serializedValues;
      if (type === 'timeDimension') {
        const filterValues = buildTimeDimensionFilterValues(filter, dataSource, false, false);

        if (operator === 'lte') {
          serializedValues = [filterValues[1]];
        } else if (operator === 'gte') {
          serializedValues = [filterValues[0]];
        } else if (operator === 'intervals') {
          serializedValues = filterValues;
        } else {
          serializedValues = [filterValues[0], filterValues[1]];
        }
        serializedValues = serializedValues.map((t) => t.replace('T00:00:00.000', ''));
      } else {
        serializedValues = values.map((v: string | number) => String(v).replace(/"/g, '""')); // csv serialize " -> ""
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

export default class BardFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property namespace
   */
  namespace = 'v1/data';

  @service ajax: TODO;

  @service
  declare naviMetadata: NaviMetadataService;

  @service
  declare requestDecorator: RequestDecoratorService;

  /**
   * Builds the dimensions path for a request
   */
  _buildDimensionsPath(request: RequestV2 /*options*/): string {
    const dimensionToFields = request.columns
      .filter((c) => c.type === 'dimension' || (c.type === 'timeDimension' && !isDateTime(c)))
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
          .map((dim) => {
            const fields = [...new Set(dimensionToFields[dim])].filter((field) => !!field);
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
    const filterGrain = timeFilter?.parameters?.grain as Grain;

    const timeColumn = request.columns.filter(isDateTime)[0];
    const columnGrain: GrainWithAll = (timeColumn?.parameters?.grain as Grain | undefined) ?? 'all';
    if (timeColumn && columnGrain !== 'all' && columnGrain !== filterGrain) {
      throw new FactAdapterError(
        `The requested filter timeGrain '${filterGrain}', must match the column timeGrain '${columnGrain}'`
      );
    }
    const filterValues = buildTimeDimensionFilterValues(timeFilter, request.dataSource, columnGrain !== 'all', true);
    if (timeFilter.operator === 'intervals') {
      return filterValues.join(',');
    }

    return `${filterValues[0]}/${filterValues[1]}`;
  }

  /**
   * Builds a metrics param string for a request
   */
  _buildMetricsParam(request: RequestV2): string {
    const metrics = request.columns.filter((col) => col.type === 'metric');
    const metricIds = metrics.map((metric) =>
      canonicalizeMetric({ metric: metric.field, parameters: metric.parameters })
    );

    return array(metricIds).uniq().join(',');
  }

  /**
   * Builds a filters param string for a request
   */
  _buildFiltersParam(request: RequestV2): string | undefined {
    const filters = request.filters
      .filter((fil) => fil.type === 'dimension' || (fil.type === 'timeDimension' && !isDateTime(fil)))
      .filter((fil) => fil.values.length !== 0);

    if (filters?.length) {
      return serializeFilters(filters, request.dataSource);
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
    const having = request.filters.filter((fil) => fil.type === 'metric' && fil.values.length !== 0);

    if (having?.length) {
      return having
        .map((having) => {
          const { field, parameters, operator, values = [] } = having;
          return `${canonicalizeMetric({ metric: field, parameters })}-${operator}[${values.join(',')}]`;
        })
        .join(',');
    }
    return undefined;
  }

  /**
   * Builds rollup query params
   * @param {RequestV2} request
   * @return {String}
   */
  _buildRollupParam(request: RequestV2): string {
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
  _buildURLPath(request: RequestV2, options: RequestOptions = {}): string {
    const host = configHost(options);
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

  /**
   * Builds a query object for a request
   */
  _buildQuery(request: RequestV2, options?: RequestOptions): Query {
    const filters = this._buildFiltersParam(request);
    const having = this._buildHavingParam(request);
    const sort = this._buildSortParam(request);
    const rollupTo = this._buildRollupParam(request);

    const query: Query = {
      dateTime: this._buildDateTimeParam(request),
      metrics: this._buildMetricsParam(request),
      ...(filters ? { filters } : {}),
      ...(having ? { having } : {}),
      ...(sort ? { sort } : {}),
      ...(rollupTo ? { rollupTo } : {}),
      ...(request.rollup?.grandTotal === true ? { rollupGrandTotal: true } : {}),
      format: options?.format ?? 'json',
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
      Object.assign(query, queryParams);
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
  @task *urlForDownloadQuery(request: RequestV2, options?: RequestOptions): TaskGenerator<string> {
    return yield this.urlForFindQuery(request, options);
  }

  /**
   * Decorates a requestV2 object
   */
  _decorate(request: RequestV2): RequestV2 {
    return this.requestDecorator.applyGlobalDecorators(request);
  }

  /**
   * Uses the url generated using the adapter to make an ajax request
   */
  @task *fetchDataForRequest(request: RequestV2, options?: RequestOptions): TaskGenerator<unknown> {
    assert('Fact request for fili adapter must be version 2', (request.requestVersion || '').startsWith('2.'));

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

    // TODO: Drop bard request on cancel https://github.com/yavin-dev/framework/issues/1340
    return yield this.ajax.request(url, {
      xhrFields: {
        withCredentials: true,
      },
      beforeSend(xhr: TODO) {
        xhr.setRequestHeader('clientid', clientId);
        Object.keys(customHeaders).forEach((name) => xhr.setRequestHeader(name, customHeaders[name]));
      },
      crossDomain: true,
      data: query,
      timeout: timeout,
    });
  }

  asyncFetchDataForRequest(_request: RequestV2, _options: RequestOptions): Promise<AsyncQueryResponse> {
    throw new FactAdapterError('Method not implemented.');
  }
}
