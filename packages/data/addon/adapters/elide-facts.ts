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
  QueryStatus,
  RequestV2
} from './fact-interface';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { v1 } from 'ember-uuid';
import { queryStrForField } from 'navi-data/utils/adapter';

interface RequestMetric {
  metric: string;
  parameters?: Dict<string>;
}
interface RequestDimension {
  dimension: string;
}

const OPERATOR_MAP: Dict<string> = {
  eq: '==',
  neq: '!='
};

export default class ElideFacts extends EmberObject implements NaviFactAdapter {
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
   * @returns graphql query string for a request
   */
  private dataQueryFromRequest(request: RequestV1): string {
    const {
      logicalTable: { table },
      metrics,
      dimensions
    } = request;
    const metricIds = metrics.map((m: RequestMetric) => m.metric); //TODO: support parameterized metrics
    const dimensionIds = dimensions.map((d: RequestDimension) => d.dimension);

    // TODO: Create filter based on request intervals, filters, and havings

    return JSON.stringify({
      query: `{ ${table} { edges { node { ${metricIds.join(' ')} ${dimensionIds.join(' ')} } } } }`
    });
  }

  /**
   * @param request
   * @returns graphql query string for a v2 request
   */
  private dataQueryFromRequestV2(request: RequestV2): string {
    const argStrings = [];
    const { table, columns, sorts, limit, filters } = request;
    const columnsStr = columns.map(col => queryStrForField(col.field, col.parameters)).join(' ');

    const filterStrings = filters.map(fil => {
      const { field, parameters, operator, values } = fil;
      const fieldStr = queryStrForField(field, parameters);
      const operatorStr = OPERATOR_MAP[operator] || `=${operator}=`;
      const valuesStr = values.length > 1 ? `(${values.join(',')})` : `${values[0]}`;
      return `${fieldStr}${operatorStr}${valuesStr}`;
    });
    filterStrings.length && argStrings.push(`filter: \\"${filterStrings.join(';')}\\"`);

    const sortStrings = sorts.map(sort => {
      const { field, parameters, direction } = sort;
      const cName = queryStrForField(field, parameters);
      return `${direction === 'desc' ? '-' : ''}${cName}`;
    });
    sortStrings.length && argStrings.push(`sort: \\"${sortStrings.join(',')}\\"`);

    const limitStr = limit ? `first: \\"${limit}\\"` : null;
    limitStr && argStrings.push(limitStr);

    const argsString = argStrings.length ? `(${argStrings.join(',')})` : '';

    return JSON.stringify({
      query: `{ ${table}${argsString} { edges { node { ${columnsStr} } } } }`
    });
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the AsyncQuery creation mutation
   */
  createAsyncQuery(request: RequestV1 | RequestV2, options: RequestOptions = {}): Promise<AsyncQueryResponse> {
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const query = request.requestVersion?.startsWith('2.')
      ? this.dataQueryFromRequestV2(request)
      : this.dataQueryFromRequest(request);
    const id: string = options.requestId || v1();

    // TODO: Add other options based on RequestOptions
    const queryOptions = { mutation, variables: { id, query } };
    return this.apollo.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated asyncQuery's id and status
   */
  cancelAsyncQuery(id: string) {
    const mutation: DocumentNode = GQLQueries['asyncFactsCancel'];
    return this.apollo.mutate({ mutation, variables: { id } });
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the AsyncQuery fetch query
   */
  fetchAsyncQuery(id: string) {
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    return this.apollo.query({ query, variables: { ids: [id] } });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(_request: RequestV1, _options: RequestOptions): string {
    return 'TODO';
  }

  /**
   * @param request
   * @param options
   */
  @task(function*(this: ElideFacts, request: RequestV1, options: RequestOptions) {
    let asyncQueryPayload = yield this.createAsyncQuery(request, options);
    const asyncQuery = asyncQueryPayload?.asyncQuery.edges[0]?.node;
    const { id } = asyncQuery;
    let status: QueryStatus = asyncQuery.status;

    while (status === QueryStatus.QUEUED || status === QueryStatus.PROCESSING) {
      yield timeout(this._pollingInterval);
      asyncQueryPayload = yield this.fetchAsyncQuery(id);
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
  fetchDataForRequest(this: ElideFacts, request: RequestV1, options: RequestOptions): Promise<AsyncQueryResponse> {
    return this.fetchDataForRequestTask.perform(request, options);
  }
}
