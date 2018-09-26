/**
 * Copyright 2018, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import SearchFilterMixin from '../../mixins/search-filter';
import { computed, get } from '@ember/object';
import { A as arr } from '@ember/array';
import reverse from 'lodash/reverse';

export default Controller.extend(SearchFilterMixin, {
  /**
   * @property {Array} sortedItems - items sorted by `sortBy` query param
   */
  sortedItems: computed('directory.sortBy', 'model.items', async function() {
    let sortBy = get(this, 'directory.sortBy');
    let items = await get(this, 'model.items');

    let sortedItems = arr(items).sortBy(sortBy);
    return sortBy === 'updatedOn' ? reverse(sortedItems) : sortedItems;
  })
});
