/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core/index.js';
import { setContext } from '@apollo/client/link/context/index.js';
import type { ClientConfig } from '../config/datasources.js';
import fetch from 'cross-fetch';

export default function getClient(config: ClientConfig) {
  function buildURLPath(dataSourceName: string): string {
    const host = config.configHost({ dataSourceName });
    let baseUrl;
    if (document) {
      baseUrl = `${document.location.protocol}${document.location.host}`;
    }
    return new URL(host, baseUrl).href;
  }

  function link() {
    const linkOptions = { credentials: 'include', fetch };
    const httpLink = new HttpLink(linkOptions);

    const contextLink = setContext((_, context) => {
      // TODO: allow for clientId to be overridden
      context.headers = Object.assign(context.headers ?? {}, { clientId: 'UI' });

      context.uri = buildURLPath(context.dataSourceName);
      return context;
    });

    return contextLink.concat(httpLink);
  }

  const defaultOptions = {
    watchQuery: { fetchPolicy: 'no-cache' as const },
    query: { fetchPolicy: 'no-cache' as const },
    mutate: { fetchPolicy: 'no-cache' as const },
  };

  return new ApolloClient({
    link: link(),
    cache: new InMemoryCache(),
    defaultOptions,
  });
}
