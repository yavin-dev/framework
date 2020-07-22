/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Search result wrapper component
 */

import Component from '@glimmer/component';

/**
 * @interface Args
 */
interface Args {
  searchResults: Array<TODO>;
}

export default class NaviWrapperSearchResultComponent extends Component<Args> {
  /**
   * @property {boolean} areTasksRunning
   */
  get areTasksRunning() {
    return this.args?.searchResults.some(searchResult => searchResult.isRunning);
  }

  /**
   * @property {boolean} areTasksRunning
   */
  get areResultsEmpty() {
    return this.args?.searchResults.every(searchResult => {
      return !searchResult.isSuccessful || !(searchResult.value.data.length > 0);
    });
  }
}
