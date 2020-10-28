/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import NaviFactAdapter, {
  RequestV1,
  RequestOptions,
  AsyncQueryResponse,
  Parameters,
  QueryStatus,
  RequestV2,
  FilterOperator,
  TableExportResponse
} from './interface';
import Interval from '../../utils/classes/interval';
import { getDefaultDataSource } from '../../utils/adapter';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { assert } from '@ember/debug';
import { v1 } from 'ember-uuid';

export const ELIDE_API_DATE_FORMAT = 'YYYY-MM-DD'; //TODO: Update to include time when elide supports using full iso date strings

const escape = (value: string | number) => {
  return `${('' + value).replace(/'/g, "\\'").replace(/,/g, '\\,')}`;
};

export const OPERATOR_MAP: Partial<Record<FilterOperator, string>> = {
  eq: '==',
  neq: '!=',
  notin: '=out=',
  null: '=isnull=true',
  notnull: '=isnull=false',
  gte: '=ge=',
  lte: '=le='
};
/**
 * Formats elide request field
 */
export function getElideField(fieldName: string, _parameters: Parameters = {}) {
  //TODO add parameter support when added to Elide
  const parts = fieldName.split('.');
  return parts[parts.length - 1];
}

export default class ElideFactsAdapter extends EmberObject implements NaviFactAdapter {
  /**
   * @property {Object} apollo - apollo client query manager using the overridden elide service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

  /**
   * @property {Number} _pollingInterval - number of ms between fetch requests during async request polling
   */
  _pollingInterval = 3000;

  /**
   * @param request
   * @returns graphql query string for a v2 request
   */
  private dataQueryFromRequest(request: RequestV2): string {
    const args = [];
    const { table, columns, sorts, limit, filters } = request;
    const columnsStr = columns.map(col => getElideField(col.field, col.parameters)).join(' ');

    const filterStrings = filters.map(filter => {
      const { field, parameters, operator, values, type } = filter;
      const fieldStr = getElideField(field, parameters);
      const operatorStr = OPERATOR_MAP[operator as FilterOperator] || `=${operator}=`;
      let filterVals = values;
      if (type === 'timeDimension' && filterVals.length === 2) {
        const { start, end } = Interval.parseFromStrings(String(filterVals[0]), String(filterVals[1])).asMoments();
        assert('The end date of a time dimension filter should be defined', end);
        filterVals = [start.format(ELIDE_API_DATE_FORMAT), end.format(ELIDE_API_DATE_FORMAT)];
      }

      // TODO: Remove this when Elide supports the "between" filter operator
      if (operator === 'bet') {
        return `${fieldStr}=ge=(${escape(filterVals[0])});${fieldStr}=le=(${escape(filterVals[1])})`;
      }

      if (operator === 'nbet') {
        return `${fieldStr}=lt=(${escape(filterVals[0])}),${fieldStr}=gt=(${escape(filterVals[1])})`;
      }

      const valuesStr = filterVals.length ? `(${filterVals.map(v => `'${escape(v)}'`).join(',')})` : '';
      return `${fieldStr}${operatorStr}${valuesStr}`;
    });
    filterStrings.length && args.push(`filter: "${filterStrings.join(';')}"`);

    const sortStrings = sorts.map(sort => {
      const { field, parameters, direction } = sort;
      const column = getElideField(field, parameters);
      return `${direction === 'desc' ? '-' : ''}${column}`;
    });
    sortStrings.length && args.push(`sort: "${sortStrings.join(',')}"`);

    const limitStr = limit ? `first: "${limit}"` : null;
    limitStr && args.push(limitStr);

    const argsString = args.length ? `(${args.join(',')})` : '';

    return JSON.stringify({
      query: `{ ${table}${argsString} { edges { node { ${columnsStr} } } } }`
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
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the TableExport creation mutation
   */
  createTableExport(request: RequestV2, options: RequestOptions = {}): Promise<TableExportResponse> {
    const mutation: DocumentNode = GQLQueries['tableExportFactsMutation'];
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
   * @returns Promise with the updated tableExport's id and status
   */
  cancelTableExport(id: string, dataSourceName?: string) {
    const mutation: DocumentNode = GQLQueries['tableExportFactsCancel'];
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
   * @param id
   * @returns Promise that resolves to the result of the TableExport fetch query
   */
  fetchTableExport(id: string, dataSourceName?: string) {
    const query: DocumentNode = GQLQueries['tableExportFactsQuery'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    return this.apollo.query({ query, variables: { ids: [id] }, context: { dataSourceName } });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(_request: RequestV1, _options: RequestOptions): string {
    return 'TODO';
  }

  /**
   * @param _request
   * @param _options
   */
  async urlForDownloadQuery(request: RequestV1, options: RequestOptions = {}): Promise<string> {
    const response = await this.fetchDataForExportTask.perform(request, options);
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
  @task(function*(this: ElideFactsAdapter, request: RequestV2, options: RequestOptions) {
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
  })
  private fetchDataForExportTask!: TODO;

  /**
   * @param request
   * @param options
   */
  @task(function*(this: ElideFactsAdapter, request: RequestV2, options: RequestOptions) {
    let asyncQueryPayload = yield this.createAsyncQuery(request, options);
    const asyncQuery = asyncQueryPayload?.asyncQuery.edges[0]?.node;
    const { id } = asyncQuery;
    let status: QueryStatus = asyncQuery.status;

    while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
      yield timeout(this._pollingInterval);
      asyncQueryPayload = yield this.fetchAsyncQuery(id, request.dataSource);
      status = asyncQueryPayload?.asyncQuery.edges[0]?.node.status;
    }
    return asyncQueryPayload;
  })
  fetchDataForRequestTask!: TODO;

  /**
   * @param this
   * @param request
   * @param options
   */
  fetchDataForRequest(
    this: ElideFactsAdapter,
    request: RequestV2,
    options: RequestOptions = {}
  ): Promise<AsyncQueryResponse> {
    return this.fetchDataForRequestTask.perform(request, options);
  }
}
