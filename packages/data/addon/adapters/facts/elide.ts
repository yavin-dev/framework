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
  QueryResultType,
  QueryResultFormatType
} from './interface';
import { getDefaultDataSource } from '../../utils/adapter';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { v1 } from 'ember-uuid';

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
      const { field, parameters, operator, values } = filter;
      const fieldStr = getElideField(field, parameters);

      // TODO: Remove this when Elide supports the "between" filter operator
      if (operator === 'bet') {
        return `${fieldStr}=ge=(${values[0]});${fieldStr}=le=(${values[1]})`;
      }

      const operatorStr = OPERATOR_MAP[operator] || `=${operator}=`;
      const valuesStr = values.length ? `(${values.map(v => `'${v}'`).join(',')})` : '';
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
    console.log('inside createAsyncQuery');
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const query = this.dataQueryFromRequest(request);
    const id: string = options.requestId || v1();
    const resultType: string = options.resultType || QueryResultType.EMBEDDED;
    const resultFormatType: string = options.resultFormatType || QueryResultFormatType.JSONAPI;
    const dataSourceName = request.dataSource || options.dataSourceName;
    // TODO: Add other options based on RequestOptions
    const queryOptions = {
      mutation,
      variables: { id, query, resultType, resultFormatType },
      context: { dataSourceName }
    };
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
    console.log('inside fetchAsyncQuery');
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    dataSourceName = dataSourceName || getDefaultDataSource().name;
    console.log('apollo');
    console.log(this.apollo.query({ query, variables: { ids: [id] }, context: { dataSourceName } }));
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
  async urlForDownloadQuery(request: RequestV1, options: RequestOptions): Promise<string> {
    let optionCopy = { ...options };
    optionCopy.resultType = QueryResultType.DOWNLOAD;
    optionCopy.resultFormatType = optionCopy.resultFormatType || QueryResultFormatType.CSV;

    if (optionCopy.resultFormatType === 'JSONAPI' || optionCopy.resultFormatType === 'GRAPHQLAPI') {
      optionCopy.resultFormatType = QueryResultFormatType.CSV;
    }
    //Download can only be CSV or JSON. Will the ui enforce that?
    console.log('inside urlForDownloadQuery');
    console.log('options');
    console.log(options);
    console.log('request ');
    console.log(request);
    //let response = await this.fetchDataForRequest(request, {
    //  resultFormatType: QueryResultFormatType.CSV,
    //  resultType: QueryResultType.DOWNLOAD,
    //  ...options
    //});
    //.catch((e: TODO) => {
    //  debugger;
    // });
    // return '';
    let response = await this.fetchDataForRequest(request, optionCopy);
    console.log('response');
    console.log(response);
    return response.asyncQuery.edges[0].node.result?.responseBody || '';
  }
  /**
   * @param request
   * @param options
   */
  @task(function*(this: ElideFactsAdapter, request: RequestV2, options: RequestOptions) {
    let asyncQueryPayload = yield this.createAsyncQuery(request, options);
    console.log('asyncQueryPayload');
    console.log(asyncQueryPayload);
    const asyncQuery = asyncQueryPayload?.asyncQuery.edges[0]?.node;
    const { id } = asyncQuery;
    let status: QueryStatus = asyncQuery.status;
    console.log('status');
    console.log(status);
    while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
      console.log('in while');
      yield timeout(this._pollingInterval);
      asyncQueryPayload = yield this.fetchAsyncQuery(id, request.dataSource);
      console.log('asyncQueryPayload 2');
      console.log(asyncQueryPayload);
      status = asyncQueryPayload?.asyncQuery.edges[0]?.node.status;
    }
    console.log('asyncQueryPayload 2');
    console.log(asyncQueryPayload);
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
    console.log('inside fetchDataForRequest');
    return this.fetchDataForRequestTask.perform(request, options);
  }
}
