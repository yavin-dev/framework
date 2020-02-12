/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';

export default class Report extends Component {
  /**
   * @property {Ember.Service} reportSearchProvider
   */
  @service('navi-report-search-provider') reportSearchProvider;

  /**
   * @property {String} searchResult
   * @description property that tracks search results returned from the service
   */
  @tracked searchResult;

  /**
   * @property {String} title
   * @description Title of search result
   */
  title = 'Reports & Dashboards';

  /**
   * @method init
   * @override
   * @description Fetch search result for the given user query
   */
  async init() {
    this.searchResult = await this.reportSearchProvider.search(get(this, 'query'));
  }
}
