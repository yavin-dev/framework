/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import NaviFactAdapter, { RequestV1, RequestOptions, AsyncQueryResponse } from './fact-interface';
import { DocumentNode } from 'graphql';
import GQLQueries from 'navi-data/gql/fact-queries';
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

export default class ElideFacts extends EmberObject implements NaviFactAdapter {
  /**
   * @property {Object} apollo - apollo client query manager using the overridden elide service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

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
  asyncFetchDataForRequest(request: RequestV1, options: RequestOptions): Promise<AsyncQueryResponse> {
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
}
