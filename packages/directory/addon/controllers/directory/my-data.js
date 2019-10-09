/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller, { inject as controller } from '@ember/controller';
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';
import { searchRecords } from 'navi-core/utils/search';
import { isEmpty } from '@ember/utils';
import moment from 'moment';

export default Controller.extend({
  /**
   * @property directory - directory controller
   */
  directory: controller(),

  /**
   * @property {Promise} searchResults - Search and rank through items in model when a search query is available
   */
  searchResults: computed('directory.q', 'sortedItems', function() {
    let queryString = get(this, 'directory.q');
    return this.sortedItems.then(items => (isEmpty(queryString) ? items : searchRecords(items, queryString, 'title')));
  }),

  /**
   * @property {Array} sortedItems - items sorted by `sortKey` and `sortDir`
   */
  sortedItems: computed('directory.{sortKey,sortDir}', 'model.items', async function() {
    let sortKey = get(this, 'directory.sortKey'),
      sortDir = get(this, 'directory.sortDir'),
      items = await get(this, 'model.items'),
      sortedItems;

    if (sortKey === 'updatedOn') {
      let getUpdatedOn = item => moment.utc(item.get('updatedOn')),
        comparator = (a, b) => getUpdatedOn(a).diff(getUpdatedOn(b));
      sortedItems = arr(items)
        .slice()
        .sort(comparator);
    } else {
      sortedItems = arr(items).sortBy(sortKey);
    }

    return sortDir === 'desc' ? sortedItems.reverse() : sortedItems;
  }),

  actions: {
    /**
     * @action updateQueryParams - update to the new query params
     * @param {Object} queryParams
     */
    updateQueryParams(queryParams) {
      this.transitionToRoute({ queryParams });
    }
  }
});
