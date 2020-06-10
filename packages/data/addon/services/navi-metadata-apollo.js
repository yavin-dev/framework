import ApolloService from 'ember-apollo-client/services/apollo';
import { setContext } from 'apollo-link-context';
import { configHost } from 'navi-data/utils/adapter';

export default class NaviMetadataApolloService extends ApolloService {
  /**
   * @property {String}
   */
  namespace = 'graphql';

  /**
   * @override
   * @method clientOptions
   * @returns {Object}
   */
  clientOptions() {
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
  get options() {
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
  link() {
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
   * @returns {String} complete url including host and namespace
   */
  _buildURLPath() {
    const host = configHost();
    const { namespace } = this;

    return `${host}/${namespace}`;
  }
}
