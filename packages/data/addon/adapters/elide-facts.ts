/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import { RequestV1, RequestOptions, AsyncQueryResponse } from './fact-interface';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
import { task, timeout } from 'ember-concurrency';
import { v1 } from 'ember-uuid';

interface ApolloMutationOptions {
  variables?: Record<string, any>;
  mutation: DocumentNode;
}
interface RequestMetric {
  metric: string;
  parameters?: Dict<string>;
}
interface RequestDimension {
  dimension: string;
}

export default class ElideFacts extends EmberObject {
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
      query: `
        ${table} {
          edges {
            node {
              ${metricIds.join(' ')} ${dimensionIds.join(' ')}
            }
          }
        }
      `,
      variables: null
    });
  }

  /**
   * @param request
   * @param options
   * @returns Promise that resolves to the result of the AsyncQuery creation mutation
   */
  createAsyncQueryRequest(request: RequestV1, options: RequestOptions = {}): Promise<AsyncQueryResponse> {
    const mutation: DocumentNode = GQLQueries['asyncFactsMutation'];
    const dataQuery = this.dataQueryFromRequest(request);
    const clientId: string = options.clientId || v1();

    // TODO: Add other options based on RequestOptions
    const queryOptions: ApolloMutationOptions = {
      mutation,
      variables: {
        ids: [clientId],
        query: dataQuery
      }
    };

    return this.apollo.mutate(queryOptions);
  }

  /**
   * @param id
   * @returns Promise with the updated asyncquery's id and status
   */
  cancelAsyncRequest(id: string) {
    const mutation: DocumentNode = GQLQueries['asyncFactsCancel'];
    return this.apollo.mutate({
      mutation,
      variables: {
        ids: [id]
      }
    });
  }

  /**
   * @param id
   * @returns Promise that resolves to the result of the AsyncQuery fetch query
   */
  fetchAsyncQueryData(id: string) {
    const query: DocumentNode = GQLQueries['asyncFactsQuery'];
    return this.apollo.query({
      query,
      variables: {
        ids: [id]
      }
    });
  }

  /**
   * @param _request
   * @param _options
   */
  urlForFindQuery(_request: RequestV1, _options: RequestOptions): string {
    throw new Error('Method not implemented.');
  }

  /**
   * @param request
   * @param options
   */
  @task(function*(request: RequestV1, options: RequestOptions) {
    let asyncQueryPayload;
    try {
      //@ts-ignore
      asyncQueryPayload = yield this.createAsyncQueryRequest(request, options);
    } catch (e) {
      return Promise.reject(e);
    }
    let { result, id } = asyncQueryPayload.asyncQuery.edges[0].node;

    while (result === null) {
      //@ts-ignore
      yield timeout(this._pollingInterval);
      //@ts-ignore
      asyncQueryPayload = yield this.fetchAsyncQueryData(id);
      result = asyncQueryPayload?.asyncQuery?.edges[0]?.node.result;
    }

    return result;
  })
  //@ts-ignore
  fetchDataForRequest: Promise<TODO>;
}
