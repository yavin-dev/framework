import Service from '@ember/service';
import { getOwner } from '@ember/application';
import config from 'ember-get-config';

/* global requirejs */

export default class NaviSearchProviderService extends Service {
  /**
   * @method getService
   * @param name
   * @returns {Object} search provider service object
   */
  getService(name) {
    return getOwner(this).lookup(`service:navi-search/${name}`);
  }

  /**
   * @method all
   * @returns {Array} an array of available search providers
   */
  all() {
    const searchProvidersRegex = new RegExp(`^(?:${config.modulePrefix}/)?services/navi-search/([a-z-]*)$`),
      searchProviderServices = Object.keys(requirejs.entries).filter(key => searchProvidersRegex.test(key)),
      searchProviderArray = searchProviderServices.map(key => this.getService(searchProvidersRegex.exec(key)[1]));
    return searchProviderArray;
  }
}
