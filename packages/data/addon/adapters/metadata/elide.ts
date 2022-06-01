/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import EmberObject from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import * as GQLQueries from '@yavin/client/gql/metadata-queries';
import { assert } from '@ember/debug';
import { DocumentNode } from 'graphql';
import { isPresent } from '@ember/utils';
import type NaviMetadataAdapter from '@yavin/client/adapters/metadata/interface';
import type { MetadataOptions } from '@yavin/client/adapters/metadata/interface';

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

    let { dataSourceName, customHeaders: headers } = options;
    let namespace = 'default';
    if (dataSourceName?.includes('.')) {
      [dataSourceName, namespace] = dataSourceName.split('.');
    }

    const queryOptions = {
      query,
      variables: {
        filter: `namespace.id=='${namespace}'`,
        ...(isPresent(id) && { ids: [id] }),
      },
      context: {
        dataSourceName,
        headers,
      },
      ...options,
    };
    return this.apollo.query(queryOptions);
  }
}
