/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NaviFactAdapter, { QueryStatus, FactAdapterError } from '../../../adapters/facts/interface.js';
import Interval from '../../../utils/classes/interval.js';
import * as GQLQueries from '../../../gql/fact-queries.js';
import moment from 'moment';
import { canonicalizeColumn } from '../../../utils/column.js';
import omitBy from 'lodash/omitBy.js';
import NativeWithCreate, { ClientService, Config, Injector, Logger } from '../../../models/native-with-create.js';
import invariant from 'tiny-invariant';
import { Operation, run, sleep, spawn, Task } from 'effection';
import getClient from '../../elide-apollo-client.js';
import { v1 } from 'uuid';
import type { RequestOptions, AsyncQueryResponse, TableExportResponse } from '../../../adapters/facts/interface.js';
import type { Parameters, Request, FilterOperator, Filter, Column, Sort, RequestV2 } from '../../../request.js';
import type { DocumentNode } from 'graphql';
import type { Moment } from 'moment';
import type { Grain } from '../../../utils/date.js';
import type MetadataService from '../../../services/interfaces/metadata.js';
import type { ApolloClient, FetchResult } from '@apollo/client/core/index.js';
import type { ClientConfig } from '../../../config/datasources.js';
import type { Debugger } from 'debug';

const escape = (value: string) => value.replace(/'/g, "\\\\'");

const DEFAULT_ASYNC_AFTER_SECONDS = 2;

/**
 * Formats elide request field as `col(param1:"val1", param2:"val2")`
 */
export function getElideField(fieldName: string, parameters: Parameters = {}, alias?: string) {
  const aliasStr = alias ? `${alias}:` : '';

  const parts = fieldName.split('.');
  const field = parts[parts.length - 1];

  const paramsInner = Object.entries(parameters)
    .map(([param, rawValue]) => {
      const val = typeof rawValue === 'string' ? `"${rawValue}"` : rawValue;
      return `${param}:${val}`;
    })
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

type PaginationOptions = {
  first: number;
  after: number;
};

const PLUGIN_NAMESPACE = 'plugins:elide:facts:adapter';

export default class ElideFactsAdapter extends NativeWithCreate implements NaviFactAdapter {
  declare apolloClient: ApolloClient<unknown>;

  @Config('client')
  declare yavinConfig: ClientConfig;

  @ClientService('navi-metadata')
  declare naviMetadata: MetadataService;

  @Logger(PLUGIN_NAMESPACE)
  declare LOG: Debugger;

  constructor(injector: Injector) {
    super(injector);
    this.apolloClient = getClient(this.yavinConfig);
  }

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
        const canonicalName = canonicalizeColumn(base);
        throw new FactAdapterError(
          `Parameters are not supported in elide unless ${canonicalName} is added as a column.`
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
    intervals: (f, v) => `${f}=in=(${v.map((e) => `'${e}'`).join(',')})`,
  };

  private buildFilterStr(filters: Filter[], canonicalToAlias: Record<string, string>): string {
    const filterStrings = filters.map((filter) => {
      const { field, parameters, operator, values, type } = filter;

      //TODO: Support intervals by creating a series of between operators and splitting each interval
      invariant(operator !== 'intervals', `Filter operator not supported: intervals`);

      //skip filters without values
      if (0 === values.length) {
        return null;
      }

      let fieldStr;
      const canonicalName = canonicalizeColumn({ field, parameters });
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
      invariant(builderFn, `Filter operator not supported: ${operator}`);
      return builderFn(fieldStr, filterVals);
    });

    return filterStrings.filter((f) => f).join(';');
  }

  private getPaginationOptions(request: Request, options: RequestOptions = {}) {
    // Elide does not have a `LIMIT` concept, so map limit value to pagination concepts
    let pagination: PaginationOptions | undefined;
    const page = options.page ?? 1;
    if (options.perPage) {
      pagination = {
        after: (page - 1) * options.perPage,
        first: options.perPage,
      };
    }

    //user preference should override adapter options
    if (request.limit && options.perPage) {
      if (request.limit <= options.perPage) {
        pagination = {
          after: 0,
          first: request.limit,
        };
      } else {
        pagination = {
          after: (page - 1) * options.perPage,
          first: options.perPage,
        };
      }
    } else if (options.perPage) {
      pagination = {
        after: (page - 1) * options.perPage,
        first: options.perPage,
      };
    } else if (request.limit) {
      pagination = {
        after: (page - 1) * request.limit,
        first: request.limit,
      };
    }
    return pagination;
  }

  /**
   * @param request
   * @returns graphql query string for a v2 request
   */
  private dataQueryFromRequest(request: Request, options?: RequestOptions): string {
    const args = [];
    const { table, columns, sorts, filters } = request;
    const columnCanonicalToAlias = columns.reduce((canonicalToAlias: Record<string, string>, column, idx) => {
      const canonicalName = canonicalizeColumn(column);
      // Use 'colX' as alias so that filters/sorts can reference the alias
      canonicalToAlias[canonicalName] = `col${idx}`;
      return canonicalToAlias;
    }, {});
    const columnsStr = columns
      .map(({ type, field, parameters }) => {
        const alias = columnCanonicalToAlias[canonicalizeColumn({ field, parameters })];
        if (type === 'timeDimension') {
          // The elide time grain is uppercase (but we serialize to lowercase to use as Grain internally)
          const grain = parameters.grain ? `${parameters.grain}`.toUpperCase() : undefined;
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
      const canonicalName = canonicalizeColumn({ field, parameters });
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

    const pagination = this.getPaginationOptions(request, options);

    if (pagination) {
      pagination.first && args.push(`first: "${pagination.first}"`);
      pagination.after && args.push(`after: "${pagination.after}"`);
    }

    const argsString = args.length ? `(${args.join(',')})` : '';

    let pageInfoString: string;
    if (pagination === null) {
      pageInfoString = '';
    } else {
      pageInfoString = ' pageInfo { startCursor endCursor totalRecords }';
    }

    return `{ ${table}${argsString} { edges { node { ${columnsStr} } }${pageInfoString} } }`;
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the AsyncQuery creation mutation
   */
  createAsyncQuery(request: Request, options: RequestOptions = {}) {
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const queryStr = this.dataQueryFromRequest(request, options);
    const query = JSON.stringify({ query: queryStr });
    const asyncAfterSeconds = DEFAULT_ASYNC_AFTER_SECONDS;
    const id: string = options.requestId || v1();
    const dataSourceName = request.dataSource || options.dataSourceName;
    const headers = options.customHeaders || {};

    // TODO: Add other options based on RequestOptions
    const queryOptions = {
      mutation,
      variables: { id, query, asyncAfterSeconds },
      context: { dataSourceName, headers },
    };
    this.LOG(`creating async query ${id}`);
    return this.apolloClient.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated asyncQuery's id and status
   */
  cancelAsyncQuery(id: string, dataSourceName: string, options: RequestOptions = {}) {
    const headers = options.customHeaders || {};
    const mutation: DocumentNode = GQLQueries['asyncFactsCancel'];
    this.LOG(`cancelling async query ${id}`);
    return this.apolloClient.mutate({ mutation, variables: { id }, context: { dataSourceName, headers } });
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the AsyncQuery fetch query
   */
  fetchAsyncQuery(
    id: string,
    dataSourceName: string,
    options: RequestOptions = {}
  ): Promise<FetchResult<AsyncQueryResponse>> {
    const headers = options.customHeaders || {};
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    this.LOG(`fetching async query ${id}`);
    return this.apolloClient.query({ query, variables: { ids: [id] }, context: { dataSourceName, headers } });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(request: Request, options: RequestOptions): string {
    return this.dataQueryFromRequest(request, options);
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the TableExport creation mutation
   */
  createTableExport(request: Request, options: RequestOptions = {}): Promise<FetchResult<TableExportResponse>> {
    const headers = options.customHeaders || {};
    const mutation: DocumentNode = GQLQueries['tableExportFactsMutation'];
    const queryStr = this.dataQueryFromRequest(request, options);
    const query = JSON.stringify({ query: queryStr });
    const id: string = options.requestId || v1();
    const dataSourceName = request.dataSource || options.dataSourceName;
    const queryOptions = { mutation, variables: { id, query }, context: { dataSourceName, headers } };
    this.LOG(`creating table export ${id}`);
    return this.apolloClient.mutate(queryOptions);
  }

  /**
   * @param id
   * @param dataSourceName
   * @returns Promise with the updated tableExport's id and status
   */
  cancelTableExport(id: string, dataSourceName: string, options: RequestOptions = {}) {
    const headers = options.customHeaders || {};
    const mutation: DocumentNode = GQLQueries['tableExportFactsCancel'];
    this.LOG(`cancelling table export ${id}`);
    return this.apolloClient.mutate({ mutation, variables: { id }, context: { dataSourceName, headers } });
  }

  urlForDownloadQuery(request: RequestV2, options: RequestOptions): Promise<string> {
    return run(this.urlForDownloadQueryTask(request, options), {
      labels: { name: `${PLUGIN_NAMESPACE}:urlForDownloadQuery` },
    });
  }

  /**
   * @param _request
   * @param _options
   */
  *urlForDownloadQueryTask(request: Request, options: RequestOptions): Operation<string> {
    const responseTask: Task<FetchResult<TableExportResponse>> = yield spawn(
      this.fetchDataForExportTask(request, options)
    );
    const response: FetchResult<TableExportResponse> = yield responseTask;
    const status = response.data?.tableExport.edges[0]?.node.status;
    if (status !== QueryStatus.COMPLETE) {
      throw new Error('Table Export Query did not complete successfully');
    }
    const url = response.data?.tableExport.edges[0]?.node.result?.url;
    if (!url) {
      throw new Error('Unable to retrieve download URL');
    }
    return url.toString();
  }

  /**
   * @param request
   * @param options
   */
  *fetchDataForExportTask(request: Request, options: RequestOptions = {}): Operation<FetchResult<TableExportResponse>> {
    let tableExportPayload: FetchResult<TableExportResponse> = yield this.createTableExport(request, options);
    const tableExport = tableExportPayload.data?.tableExport.edges[0]?.node;
    invariant(tableExport, 'table export response is valid');
    const { id } = tableExport;
    let status: QueryStatus = tableExport.status;

    try {
      while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        yield sleep(this._pollingInterval);
        tableExportPayload = yield this.fetchTableExport(id, request.dataSource, options);
        const { data } = tableExportPayload;
        invariant(data, 'table export response is valid');
        status = data.tableExport.edges[0]?.node.status;
      }
      this.LOG(`finished table export ${id}`);
      return tableExportPayload;
    } finally {
      if (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        yield this.cancelTableExport(id, request.dataSource, options);
      }
    }
  }

  /**
   * @param id
   * @param dataSourceName
   * @returns Promise that resolves to the result of the TableExport fetch query
   */
  fetchTableExport(
    id: string,
    dataSourceName: string,
    options: RequestOptions = {}
  ): Promise<FetchResult<TableExportResponse>> {
    const headers = options.customHeaders || {};
    const query: DocumentNode = GQLQueries['tableExportFactsQuery'];
    this.LOG(`fetching table export ${id}`);
    return this.apolloClient.query({ query, variables: { ids: [id] }, context: { dataSourceName, headers } });
  }

  /**
   * @param request
   * @param options
   */
  *fetchDataForRequestTask(request: Request, options: RequestOptions): Operation<FetchResult<AsyncQueryResponse>> {
    let asyncQueryPayload: FetchResult<AsyncQueryResponse> = yield this.createAsyncQuery(request, options);
    const asyncQuery = asyncQueryPayload.data?.asyncQuery.edges[0]?.node;
    invariant(asyncQuery, 'async query response is valid');
    let id = asyncQuery.id;
    let status: QueryStatus = asyncQuery.status;

    try {
      while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        yield sleep(this._pollingInterval);
        asyncQueryPayload = yield this.fetchAsyncQuery(id, request.dataSource, options);
        const { data } = asyncQueryPayload;
        invariant(data, 'async query response is valid');
        status = data.asyncQuery.edges[0]?.node.status;
      }
      this.LOG(`finished async query ${id}`);
      return asyncQueryPayload;
    } finally {
      if (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
        yield this.cancelAsyncQuery(id, request.dataSource, options);
      }
    }
  }

  /**
   * @param request
   * @param options
   */
  async fetchDataForRequest(request: Request, options: RequestOptions = {}): Promise<FetchResult<AsyncQueryResponse>> {
    const toSpawn = this.fetchDataForRequestTask(request, options);
    return run(
      function* () {
        const fetchTask: Task<FetchResult<AsyncQueryResponse>> = yield spawn(toSpawn);
        const payload: FetchResult<AsyncQueryResponse> = yield fetchTask;
        const responseStr = payload.data?.asyncQuery.edges[0].node.result?.responseBody || '{}';
        const responseBody = JSON.parse(responseStr);
        if (responseBody.errors) {
          throw payload;
        } else {
          return payload;
        }
      },
      { labels: { name: `${PLUGIN_NAMESPACE}:fetchDataForRequest` } }
    );
  }
}
