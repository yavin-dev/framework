/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import NaviFactAdapter, { QueryStatus, FactAdapterError } from './interface';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import Interval from '../../utils/classes/interval';
import { getDefaultDataSource } from '../../utils/adapter';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import { v1 } from 'ember-uuid';
import moment from 'moment';
import { canonicalizeMetric } from 'navi-data/utils/metric';
import { omitBy } from 'lodash-es';
import type {
  RequestV1,
  RequestOptions,
  AsyncQueryResponse,
  TableExportResponse,
  Parameters,
  RequestV2,
  FilterOperator,
  Filter,
  Column,
  Sort,
} from './interface';
import type { DocumentNode } from 'graphql';
import type { Moment } from 'moment';
import type { Grain } from 'navi-data/utils/date';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { TaskGenerator } from 'ember-concurrency';

const escape = (value: string) => value.replace(/'/g, "\\\\'");

/**
 * Formats elide request field as `col(param1:"val1", param2:"val2")`
 */
export function getElideField(fieldName: string, parameters: Parameters = {}, alias?: string) {
  const aliasStr = alias ? `${alias}:` : '';

  const parts = fieldName.split('.');
  const field = parts[parts.length - 1];

  const paramsInner = Object.entries(parameters)
    .map(([param, val]) => `${param}:"${val}"`)
    .join(', ');
  const paramsStr = paramsInner.length > 0 ? `(${paramsInner})` : '';

  return `${aliasStr}${field}${paramsStr}`;
}

/**
 * Formats elide filter field as `col[param1:val1][param2:val2]`
 */
export function getElideFilterField(fieldName: string, parameters: Parameters = {}) {
  const parts = fieldName.split('.');
  const field = parts[parts.length - 1];

  const paramsStr = Object.entries(parameters)
    .map(([param, val]) => `[${param}:${val}]`)
    .join('');

  return `${field}${paramsStr}`;
}

export default class ElideFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property {Object} apollo - apollo client query manager using the overridden elide service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

  @service naviMetadata!: NaviMetadataService;

  /**
   * @property {Number} _pollingInterval - number of ms between fetch requests during async request polling
   */
  _pollingInterval = 3000;

  assertAllDefaultParams(base: Column | Filter | Sort, dataSourceName: string) {
    const meta = this.naviMetadata.getById(base.type, base.field, dataSourceName);
    if (meta) {
      const defaultParams = meta.getDefaultParameters() || {};
      const nonDefaultParams = omitBy(base.parameters, (v, k) => defaultParams[k] === v);
      if (Object.keys(nonDefaultParams).length !== 0) {
        const canonicalName = canonicalizeMetric({ metric: base.field, parameters: base.parameters });
        throw new FactAdapterError(
          `Parameters are not supported in elide unles ${canonicalName} is added as a column.`
        );
      }
    }
  }

  private readonly grainFormats: Partial<Record<Grain, string>> = {
    second: 'yyy-MM-DDTHH:mm:ss',
    minute: 'yyyy-MM-DDTHH:mm',
    hour: 'yyyy-MM-DDTHH',
    day: 'yyyy-MM-DD',
    week: 'yyyy-MM-DD',
    isoWeek: 'yyyy-MM-DD',
    month: 'yyyy-MM',
    quarter: 'yyyy-MM',
    year: 'yyyy',
  };

  private formatTimeValue(value: Moment | string, grain: Grain) {
    return moment.utc(value).format(this.grainFormats[grain]);
  }

  private filterBuilders: Record<FilterOperator, (field: string, value: string[]) => string> = {
    eq: (f, v) => `${f}==('${v[0]}')`,
    neq: (f, v) => `${f}!=('${v[0]}')`,
    in: (f, v) => `${f}=in=(${v.map((e) => `'${e}'`).join(',')})`,
    ini: (f, v) => `${f}=ini=(${v.map((e) => `'${e}'`).join(',')})`,
    notin: (f, v) => `${f}=out=(${v.map((e) => `'${e}'`).join(',')})`,
    contains: (f, v) => `${f}=in=(${v.map((e) => `'*${e}*'`).join(',')})`,
    isnull: (f, v) => `${f}=isnull=${v[0]}`,
    lte: (f, v) => `${f}=le=('${v}')`,
    gte: (f, v) => `${f}=ge=('${v}')`,
    lt: (f, v) => `${f}=lt=('${v}')`,
    gt: (f, v) => `${f}=gt=('${v}')`,
    bet: (f, v) => `${f}=ge=('${v[0]}');${f}=le=('${v[1]}')`,
    nbet: (f, v) => `${f}=lt=('${v[0]}'),${f}=gt=('${v[1]}')`,
  };

  private buildFilterStr(filters: Filter[], canonicalToAlias: Record<string, string>): string {
    const filterStrings = filters.map((filter) => {
      const { field, parameters, operator, values, type } = filter;

      //skip filters without values
      if (0 === values.length) {
        return null;
      }

      let fieldStr;
      const canonicalName = canonicalizeMetric({ metric: field, parameters });
      if (canonicalToAlias[canonicalName]) {
        fieldStr = canonicalToAlias[canonicalName];
      } else {
        fieldStr = getElideFilterField(field, parameters);
      }
      let filterVals = values.map((v) => escape(`${v}`));

      if (type === 'timeDimension' && operator !== 'isnull') {
        const grain = filter.parameters.grain as Grain;
        let timeValues: (Moment | string)[] = filterVals;
        if (['bet', 'nbet'].includes(operator)) {
          let startValue = String(filterVals[0]);
          let endValue = String(filterVals[1]);
          const { start, end } = Interval.parseInclusive(startValue, endValue, grain).asMomentsInclusive(grain);
          timeValues = [start, end];
        }
        filterVals = timeValues.map((v) => this.formatTimeValue(v, grain));
      }
      const builderFn = this.filterBuilders[operator];
      assert(`Filter operator not supported: ${operator}`, builderFn);
      return builderFn(fieldStr, filterVals);
    });

    return filterStrings.filter((f) => f).join(';');
  }

  /**
   * @param request
   * @returns graphql query string for a v2 request
   */
  private dataQueryFromRequest(request: RequestV2): string {
    const args = [];
    const { table, columns, sorts, limit, filters } = request;
    const columnCanonicalToAlias = columns.reduce((canonicalToAlias: Record<string, string>, column, idx) => {
      const canonicalName = canonicalizeMetric({ metric: column.field, parameters: column.parameters });
      // Use 'colX' as alias so that filters/sorts can reference the alias
      canonicalToAlias[canonicalName] = `col${idx}`;
      return canonicalToAlias;
    }, {});
    const columnsStr = columns
      .map(({ type, field, parameters }) => {
        const alias = columnCanonicalToAlias[canonicalizeMetric({ metric: field, parameters })];
        if (type === 'timeDimension') {
          // The elide time grain is uppercase (but we serialize to lowercase to use as Grain internally)
          const grain = parameters.grain?.toUpperCase();
          parameters = {
            ...parameters,
            ...(grain ? { grain } : {}),
          };
        }
        return getElideField(field, parameters, alias);
      })
      .join(' ');

    const filterString = this.buildFilterStr(filters, columnCanonicalToAlias);
    filterString.length && args.push(`filter: "${filterString}"`);

    const sortStrings = sorts.map((sort) => {
      const { field, parameters, direction } = sort;

      let column;
      const canonicalName = canonicalizeMetric({ metric: field, parameters });
      if (columnCanonicalToAlias[canonicalName]) {
        column = columnCanonicalToAlias[canonicalName];
      } else {
        this.assertAllDefaultParams(sort, request.dataSource);
        // TODO: Non default Parameters cannot be specified in filters yet
        column = getElideField(field, {});
      }
      return `${direction === 'desc' ? '-' : ''}${column}`;
    });
    sortStrings.length && args.push(`sort: "${sortStrings.join(',')}"`);

    const limitStr = limit ? `first: "${limit}"` : null;
    limitStr && args.push(limitStr);

    const argsString = args.length ? `(${args.join(',')})` : '';

    return JSON.stringify({
      query: `{ ${table}${argsString} { edges { node { ${columnsStr} } } } }`,
    });
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the AsyncQuery creation mutation
   */
  createAsyncQuery(request: RequestV2, options: RequestOptions = {}): Promise<AsyncQueryResponse> {
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const query = this.dataQueryFromRequest(request);
    const id: string = options.requestId || v1();
    const dataSourceName = request.dataSource || options.dataSourceName;

    // TODO: Add other options based on RequestOptions
    const queryOptions = { mutation, variables: { id, query }, context: { dataSourceName } };
    return this.apollo.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated asyncQuery's id and status
   */
  cancelAsyncQuery(id: string, dataSourceName?: string) {
    const mutation: DocumentNode = GQLQueries['asyncFactsCancel'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.mutate({ mutation, variables: { id }, context: { dataSourceName } });
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the AsyncQuery fetch query
   */
  fetchAsyncQuery(id: string, dataSourceName?: string) {
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.query({ query, variables: { ids: [id] }, context: { dataSourceName } });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(request: RequestV2, _options: RequestOptions): string {
    return this.dataQueryFromRequest(request);
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the TableExport creation mutation
   */
  createTableExport(request: RequestV2, options: RequestOptions = {}): Promise<TableExportResponse> {
    console.log('create table export');
    const mutation: DocumentNode = GQLQueries['tableExportFactsMutation'];
    const query = this.dataQueryFromRequest(request);
    console.log('query', query);
    const id: string = options.requestId || v1();
    const dataSourceName = request.dataSource || options.dataSourceName;
    console.log('dataSourceName ', dataSourceName);
    // TODO: Add other options based on RequestOptions
    const queryOptions = { mutation, variables: { id, query }, context: { dataSourceName } };
    console.log('queryOptions ', queryOptions);
    return this.apollo.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated tableExport's id and status
   */
  cancelTableExport(id: string, dataSourceName?: string) {
    console.log('cancel table export');
    const mutation: DocumentNode = GQLQueries['tableExportFactsCancel'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.mutate({ mutation, variables: { id }, context: { dataSourceName } });
  }

  /**
   * @param request
   * @param options
   */
  @task *fetchDataForRequestTask(
    this: ElideFactsAdapter,
    request: RequestV2,
    options: RequestOptions
  ): TaskGenerator<AsyncQueryResponse> {
    let asyncQueryPayload = yield this.createAsyncQuery(request, options);
    const asyncQuery = asyncQueryPayload?.asyncQuery.edges[0]?.node;
    let id = asyncQuery.id;
    let status: QueryStatus = asyncQuery.status;

    try {
      while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        yield timeout(this._pollingInterval);
        asyncQueryPayload = yield this.fetchAsyncQuery(id, request.dataSource);
        status = asyncQueryPayload?.asyncQuery.edges[0]?.node.status;
      }
      return asyncQueryPayload;
    } finally {
      if (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        console.error(`cancelled query ${id}`, asyncQueryPayload);
        yield this.cancelAsyncQuery(id, request.dataSource);
      }
    }
  }

  /**
   * @param this
   * @param request
   * @param options
   */
  @task *fetchDataForRequest(
    this: ElideFactsAdapter,
    request: RequestV2,
    options: RequestOptions = {}
  ): TaskGenerator<AsyncQueryResponse> {
    const payload: AsyncQueryResponse = yield taskFor(this.fetchDataForRequestTask).perform(request, options);
    const responseStr = payload?.asyncQuery.edges[0].node.result?.responseBody || '{}';
    const responseBody = JSON.parse(responseStr);
    if (responseBody.errors) {
      throw payload;
    } else {
      return payload;
    }
  }

  /**
   * @param _request
   * @param _options
   */
  @task *urlForDownloadQuery(request: RequestV1, options: RequestOptions): TaskGenerator<string> {
    console.log('urlForDownloadQuery');
    const response = yield taskFor(this.fetchDataForExportTask).perform(request, options);
    console.log('response ', response);
    const status: QueryStatus = response.tableExport.edges[0]?.node.status;
    if (status !== QueryStatus.COMPLETE) {
      throw new Error('Table Export Query did not complete successfully');
    }
    const url = response.tableExport.edges[0]?.node.result?.url;
    if (!url) {
      throw new Error('Unable to retrieve download URL');
    }
    return url.toString();
  }

  /**
   * @param request
   * @param options
   */
  @task *fetchDataForExportTask(
    this: ElideFactsAdapter,
    request: RequestV2,
    options: RequestOptions = {}
  ): TaskGenerator<TableExportResponse> {
    console.log('fetchDataForExportTask');
    let tableExportPayload = yield this.createTableExport(request, options);
    const tableExport = tableExportPayload?.tableExport.edges[0]?.node;
    const { id } = tableExport;
    let status: QueryStatus = tableExport.status;

    while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
      yield timeout(this._pollingInterval);
      tableExportPayload = yield this.fetchTableExport(id, request.dataSource);
      status = tableExportPayload?.tableExport.edges[0]?.node.status;
    }
    return tableExportPayload;
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the TableExport fetch query
   */
  fetchTableExport(id: string, dataSourceName?: string) {
    console.log('fetch table export');
    const query: DocumentNode = GQLQueries['tableExportFactsQuery'];
    console.log('query ', query);
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    console.log('dataSourceName ', dataSourceName);
    return this.apollo.query({ query, variables: { ids: [id] }, context: { dataSourceName } });
  }
}
