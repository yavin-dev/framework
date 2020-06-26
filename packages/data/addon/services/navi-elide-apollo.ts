/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ApolloService from 'ember-apollo-client/services/apollo';
import { setContext } from 'apollo-link-context';
import { configHost } from 'navi-data/utils/adapter';

export default class NaviElideApolloService extends ApolloService {
  /**
   * @property {String} namespace
   */
  namespace = 'graphql';

  /**
   * @override
   * @method clientOptions
   * @returns options
   */
  clientOptions(): object {
    return {
      link: this.link(),
      cache: this.cache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'no-cache'
        },
        query: {
          fetchPolicy: 'no-cache'
        },
        mutate: {
          fetchPolicy: 'no-cache'
        }
      }
    };
  }

  /**
   * @override
   * @property {Object} options - set the api used at the service level rather than the app level
   */
  get options(): object {
    const defaultOptions = super.options;

    return Object.assign({}, defaultOptions, {
      apiURL: this._buildURLPath(),
      requestCredentials: 'include'
    });
  }

  /**
   * @override
   * @method link
   * @returns {ApolloLink} Adds our own headers to the request sent at the end of the Apollo links
   */
  link(): object {
    const httpLink = super.link();
    const headersLink = setContext((_, context) => {
      context.headers = Object.assign(context.headers || {}, {
        'Content-Type': 'application/json',
        clientId: 'UI'
      });

      return context;
    });

    return headersLink.concat(httpLink);
  }

  /**
   * @method _buildURLPath
   * @returns complete url including host and namespace
   */
  _buildURLPath(): string {
    const host = configHost();
    const { namespace } = this;

    return `${host}/${namespace}`;
  }
}

declare module '@ember/service' {
  interface Registry {
    'navi-elide-apollo': NaviElideApolloService;
  }
}
