/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller, { inject as controller } from '@ember/controller';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import DirectoryController from './directory';
import { searchRecords } from 'navi-data/utils/search';

export default abstract class SearchFilterController extends Controller {
  /**
   * @property directory - directory controller
   */
  @controller directory!: DirectoryController;

  abstract get sortedItems(): Promise<Array<TODO>>;

  /**
   * @property {Promise} searchResults - Search and rank through items in model when a search query is available
   */
  @computed('directory.q', 'sortedItems')
  get searchResults() {
    const { q } = this.directory;
    return this.sortedItems.then((items) => (isEmpty(q) ? items : searchRecords(items, q, 'title')));
  }
}
