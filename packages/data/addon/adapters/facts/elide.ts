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
  RequestV2
} from './interface';
import { getDefaultDataSource } from '../../utils/adapter';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { v1 } from 'ember-uuid';

export const OPERATOR_MAP: Dict<string> = {
  eq: '==',
  neq: '!=',
  notin: '=out='
};

/**
 * ex: { field: 'table.foo', parameters: { bar: 'baz', bang: 'boom' } } -> 'foo(bar: baz,bang: boom)'
 * @param fieldName
 * @param parameters
 */
export function getElideField(fieldName: string, parameters: Parameters = {}) {
  const parts = fieldName.split('.');
  const requestField = parts[parts.length - 1];
  const params = Object.keys(parameters)
    .map(key => `${key}: ${parameters[key]}`)
    .join(',');

  return params.length ? `${requestField}(${params})` : requestField;
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
      const { field, parameters, operator, values } = filter;
      const fieldStr = getElideField(field, parameters);
      const operatorStr = OPERATOR_MAP[operator] || `=${operator}=`;
      const valuesStr = `(${values.join(',')})`;
      return `${fieldStr}${operatorStr}${valuesStr}`;
    });
    filterStrings.length && args.push(`filter: \\"${filterStrings.join(';')}\\"`);

    const sortStrings = sorts.map(sort => {
      const { field, parameters, direction } = sort;
      const column = getElideField(field, parameters);
      return `${direction === 'desc' ? '-' : ''}${column}`;
    });
    sortStrings.length && args.push(`sort: \\"${sortStrings.join(',')}\\"`);

    const limitStr = limit ? `first: \\"${limit}\\"` : null;
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
  urlForFindQuery(_request: RequestV1, _options: RequestOptions): string {
    return 'TODO';
  }

  /**
   * @param _request
   * @param _options
   */
  async urlForDownloadQuery(_request: RequestV1, _options: RequestOptions): Promise<string> {
    return 'TODO';
  }
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
