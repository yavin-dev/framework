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
 * @constant EMPTY_RESULT – Empty result object
 */
const EMPTY_RESULT = {
  title: '',
  component: 'navi-search-result/no-result'
};

/**
 * @constant ENTER_KEY
 */
const ENTER_KEY = 13;

/**
 * @constant ESCAPE_KEY
 */
const ESCAPE_KEY = 27;

export default class NaviSearchBarComponent extends Component {
  /**
   * @property {Ember.Service} searchProviderService
   */
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
   * @method onKeyUp – Perform search based on user query
   * @param {Object} dd
   * @param {Object} event
   */
  @action
  onKeyUp(dd, event) {
    // Close results window if the user deletes the query or presses escape
    if (this.searchQuery.length === 0 || event.keyCode === ESCAPE_KEY) {
      // Empty results if search query is deleted
      if (this.searchQuery.length === 0) {
        this.searchResults = [];
      }

      dd.actions.close(event);
      // Don't perform query if you press escape or delete query
      return;
    }

    // Perform search on enter press or when query is longer than 2 characters
    if ((event.keyCode === ENTER_KEY && this.searchQuery.length !== 0) || this.searchQuery.length > 2) {
      this.launchQuery.perform(this.searchQuery, dd, event);
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
  *launchQuery(query, dd, event) {
    dd.actions.open(event);
    this.searchResults = yield this.searchProviderService.search.perform(query);
    if (this.searchResults.length === 0 && query !== '') {
      this.searchResults = [EMPTY_RESULT];
    }
  }
}
