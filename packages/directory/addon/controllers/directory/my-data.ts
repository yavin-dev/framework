/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import SearchFilterController from '../search-filter';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action, computed } from '@ember/object';
import { A as arr } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { ModelFrom } from 'navi-core/utils/type-utils';
import DirectoryMyDataRoute from 'navi-directory/routes/directory/my-data';

export default class DirectoryMyDataController extends SearchFilterController {
  @tracked model!: ModelFrom<DirectoryMyDataRoute>;

  /**
   * @property {Promise<Array>} sortedItems - items sorted by `sortKey` and `sortDir`
   */
  @computed('directory.{sortKey,sortDir}', 'model.items')
  get sortedItems() {
    const {
      directory: { sortKey, sortDir },
    } = this;

    return this.model.items.then((items) => {
      let sortedItems;
      if (sortKey === 'updatedOn') {
        let getUpdatedOn = (item: any) => moment.utc(item.get('updatedOn')),
          comparator = (a: any, b: any) => getUpdatedOn(a).diff(getUpdatedOn(b));
        sortedItems = arr(items).slice().sort(comparator);
      } else {
        sortedItems = arr(items).sortBy(sortKey);
      }

      if (sortDir === 'desc') {
        return sortedItems.reverse();
      } else {
        return sortedItems;
      }
    });
  }

  /**
   * @action updateQueryParams - update to the new query params
   * @param {object} queryParams
   */
  @action
  updateQueryParams(queryParams: object) {
    this.transitionToRoute({ queryParams });
  }
}

declare module '@ember/controller' {
  interface Registry {
    'directory.my-data': DirectoryMyDataController;
  }
}
