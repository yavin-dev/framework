/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import SearchFilterController from '../search-filter';
import { computed, action } from '@ember/object';
import { A as arr } from '@ember/array';
import moment from 'moment';
import { ModelFrom } from '../../utils/type-utils';
import DirectoryMyDataRoute from 'dummy/routes/directory/my-data';

export default class DirectoryMyDataController extends SearchFilterController {
  model!: ModelFrom<DirectoryMyDataRoute>;

  /**
   * @property {Promise<Array>} sortedItems - items sorted by `sortKey` and `sortDir`
   */
  @computed('directory.{sortKey,sortDir}', 'model.items')
  get sortedItems() {
    return new Promise<Array<any>>(async resolve => {
      const {
        directory: { sortKey, sortDir }
      } = this;
      const items = await this.model.items;

      let sortedItems;
      if (sortKey === 'updatedOn') {
        let getUpdatedOn = (item: any) => moment.utc(item.get('updatedOn')),
          comparator = (a: any, b: any) => getUpdatedOn(a).diff(getUpdatedOn(b));
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
