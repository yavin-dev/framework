/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Navi Search Bar
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { keepLatestTask } from 'ember-concurrency-decorators';

/**
 * @constant emptyResult – Empty result object
 */
const emptyResult = [
  {
    title: '',
    component: 'navi-search-result/no-result'
  }
];

export default class NaviSearchBarComponent extends Component {
  @service('navi-search-provider') searchProviderService;

  /**
   * @property {String} searchQuery
   */
  @tracked searchQuery = '';
  /**
   * @property {String} searchResults
   */
  @tracked searchResults = [];

  /**
   * @method search – Perform search based on user query
   * @param {Object} dd
   * @param {Object} event
   */
  @action
  search(dd, event) {
    // Close results window if the user deletes the query or presses escape
    if (this.searchQuery.length == 0 || event.code === 'Escape') {
      dd.actions.close(event);
      // Don't perform query if you press escape
      return;
    }

    if ((event.code === 'Enter' && this.searchQuery.length != 0) || this.searchQuery.length > 2) {
      this.launchQuery.perform(this.searchQuery, dd);
    }
  }

  /**
   * @method focus – Open result window on search bar focus
   * @param {Object} dd
   * @param {Object} event
   */
  @action
  focus(dd, event) {
    if (this.searchQuery !== '') {
      dd.actions.open(event);
    }
  }

  /**
   * @method closeResults – Close result pane on result component action
   * @param {Object} dd
   * @param {Object} event
   */
  @action
  closeResults(dd, event) {
    dd.actions.close(event);
    event.stopPropagation();
  }

  /**
   * @method launchQuery – Launch search task
   * @param {String} query
   * @param {Object} dd
   */
  @keepLatestTask
  *launchQuery(query, dd) {
    dd.actions.open(event);
    this.searchResults = yield this.searchProviderService.search.perform(query);
    if (this.searchResults.length == 0 && query !== '') {
      this.searchResults = emptyResult;
    }
  }
}
