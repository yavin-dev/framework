/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import GQLQueries from 'navi-data/gql/metadata-queries';
import { assert } from '@ember/debug';
import { DocumentNode } from 'graphql';
import { isPresent } from '@ember/utils';
import NaviMetadataAdapter, { MetadataOptions } from './interface';

export type MetadataQueryType = keyof typeof GQLQueries;

export default class ElideMetadataAdapter extends EmberObject implements NaviMetadataAdapter {
  /**
   * @property {Object} apollo - apollo client query manager using the overridden metadata service
   */
  @queryManager({ service: 'navi-elide-apollo' })
  apollo: TODO;

  fetchEverything(options?: MetadataOptions): Promise<TODO> {
    return this.fetchAll('table', options);
  }

  fetchAll(type: MetadataQueryType, options?: MetadataOptions) {
    return this.fetchById(type, '', options);
  }

  fetchById(type: MetadataQueryType, id: string, options: MetadataOptions = {}) {
    const query: DocumentNode | undefined = GQLQueries[type]?.[id ? 'single' : 'all'];

    assert(
      'Type requested in ElideMetadataAdapter must be defined as a query in the gql/metadata-queries.js file',
      query
    );

    const queryOptions = {
      query,
      ...(isPresent(id) && { variables: { ids: [id] } }),
      context: {
        dataSourceName: options.dataSourceName
      },
      ...options
    };
    return this.apollo.query(queryOptions);
  }
}
