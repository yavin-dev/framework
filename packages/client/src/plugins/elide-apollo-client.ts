/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
//@ts-ignore - no types for cjs direct import
import * as ApolloClientCore from '@apollo/client/core/core.cjs';
import type ApolloClientCoreType from '@apollo/client/core/index.js';
const { ApolloClient, InMemoryCache, HttpLink } = ApolloClientCore as typeof ApolloClientCoreType;
import type ApolloLinkContextType from '@apollo/client/link/context/index.js';
//@ts-ignore - no types for cjs direct import
import * as ApolloLinkContext from '@apollo/client/link/context/context.cjs';
const { setContext } = ApolloLinkContext as typeof ApolloLinkContextType;
import type { ClientConfig } from '../config/datasources.js';
import fetch from 'cross-fetch';

export default function getClient(config: ClientConfig) {
  function buildURLPath(dataSourceName: string): string {
    const host = config.configHost({ dataSourceName });
    let baseUrl;
    if (globalThis.document) {
      const { protocol, host } = globalThis.document.location;
      baseUrl = `${protocol}${host}`;
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
