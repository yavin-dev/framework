/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import queries from '../../../gql/metadata-queries.js';
import invariant from 'tiny-invariant';
import { isPresent } from '../../../utils/index.js';
import type NaviMetadataAdapter from '../../../adapters/metadata/interface.js';
import type { MetadataOptions } from '../../../adapters/metadata/interface.js';
import { QueryOptions } from '@apollo/client/core';
import NativeWithCreate, { Config } from '../../../models/native-with-create.js';
import type { Injector } from '../../../models/native-with-create.js';
import type { ApolloClient } from '@apollo/client/core';
import getClient from '../../elide-apollo-client.js';
import type { ClientConfig } from '../../../config/datasources.js';

export type MetadataQueryType = keyof typeof queries;

export default class ElideMetadataAdapter extends NativeWithCreate implements NaviMetadataAdapter {
  @Config('client')
  declare yavinConfig: ClientConfig;

  declare apolloClient: ApolloClient<unknown>;

  constructor(injector: Injector) {
    super(injector);
    this.apolloClient = getClient(this.yavinConfig);
  }

  fetchEverything(options?: MetadataOptions) {
    return this.fetchAll('table', options);
  }

  fetchAll(type: MetadataQueryType, options?: MetadataOptions) {
    return this.fetchById(type, '', options);
  }

  fetchById(type: MetadataQueryType, id: string, options: MetadataOptions = {}) {
    const query = queries[type]?.[id ? 'single' : 'all'];

    invariant(
      query,
      'Type requested in ElideMetadataAdapter must be defined as a query in the gql/metadata-queries.js file'
    );

    let { dataSourceName, customHeaders: headers } = options;
    let namespace = 'default';
    if (dataSourceName?.includes('.')) {
      [dataSourceName, namespace] = dataSourceName.split('.');
    }

    const queryOptions = {
      query: query,
      variables: {
        filter: `namespace.id=='${namespace}'`,
        ...(isPresent(id) && { ids: [id] }),
      },
      context: {
        dataSourceName,
        headers,
      },
      ...options,
    } as QueryOptions;
    return this.apolloClient.query(queryOptions);
  }
}
