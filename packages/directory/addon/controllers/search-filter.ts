/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { isEmpty } from '@ember/utils';
import DirectoryController from './directory';
// @ts-ignore
import { searchRecords } from 'navi-core/utils/search';

export default abstract class SearchFilterController extends Controller {
  /**
   * @property directory - directory controller
   */
  @controller directory!: DirectoryController;

  abstract get sortedItems(): Promise<Array<TODO>>;

  /**
   * @property {Promise} searchResults - Search and rank through items in model when a search query is available
   */
  get searchResults() {
    const { q } = this.directory;
    return this.sortedItems.then(items => (isEmpty(q) ? items : searchRecords(items, q, 'title')));
  }
}
