/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import GQLQueries from 'navi-data/gql/metadata-queries';
import { assert } from '@ember/debug';
import { DocumentNode } from 'graphql';

export type MetadataQueryType = keyof typeof GQLQueries;
export interface MetadataRequestOptions {
  dataSourceName?: string;
  variables?: Dict<string>;
}

export default class GraphQLMetadataAdapter extends EmberObject {
  /**
   * @property {Object} apollo - apollo client query manager using the overriden metadata service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

  /**
   * @method fetchAll
   * @param {String} type
   * @param {Object} options
   * @returns {Object} JSON response
   */
  fetchAll(type: MetadataQueryType, options: MetadataRequestOptions) {
    return this.fetchMetadata(type, undefined, options);
  }

  /**
   * @method fetchMetadata
   * @param {String} type
   * @param {String} id
   * @param {Object} options
   * @returns {Object} JSON response for type
   */
  async fetchMetadata(type: MetadataQueryType, id: string | undefined, options: MetadataRequestOptions = {}) {
    const query: DocumentNode | undefined = GQLQueries[type]?.[id ? 'single' : 'all'];

    assert(
      'Type requested in navi-data/elide-metadata adapter must be defined as a query in the gql/metadata-queries.js file',
      query
    );

    const queryOptions = Object.assign({}, options, { query });
    if (id) {
      queryOptions.variables = Object.assign(queryOptions.variables || {}, {
        ids: [id]
      });
    }

    return await this.apollo.query(queryOptions);
  }
}
