/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import SearchFilterMixin from '../../mixins/search-filter';
import { computed, get, action } from '@ember/object';
import { A as arr } from '@ember/array';
import moment from 'moment';

class MyData extends Controller.extend(SearchFilterMixin) {
  /**
   * @property {Promise<Array>} sortedItems - items sorted by `sortKey` and `sortDir`
   */
  @computed('directory.{sortKey,sortDir}', 'model.items')
  get sortedItems() {
    return new Promise(async resolve => {
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

      if (sortDir === 'desc') {
        resolve(sortedItems.reverse());
      } else {
        resolve(sortedItems);
      }
    });
  }

  /**
   * @action updateQueryParams - update to the new query params
   * @param {Object} queryParams
   */
  @action
  updateQueryParams(queryParams) {
    this.transitionToRoute({ queryParams });
  }
}

export default MyData;
