/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import SearchFilterMixin from '../../mixins/search-filter';
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';
import moment from 'moment';

export default Controller.extend(SearchFilterMixin, {
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
  })
});
