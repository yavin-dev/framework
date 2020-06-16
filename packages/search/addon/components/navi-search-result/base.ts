/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Base search result component
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * @interface Args
 */
interface Args {
  data: Array<TODO>;
}

export default class NaviBaseSearchResultComponent extends Component<Args> {
  /**
   * @property {boolean} showTop
   */
  @tracked showTop: boolean = true;

  /**
   * @property {number} numberOfTopResults
   */
  @tracked numberOfTopResults: number = 10;

  /**
   * @property {boolean} hasMoreResults
   */
  get hasMoreResults(): boolean {
    return this.args?.data.length > this.numberOfTopResults;
  }

  /**
   * @property {Array} results
   */
  get data(): Array<Object> {
    if (this.showTop && this.hasMoreResults) {
      return this.args?.data.slice(0, this.numberOfTopResults);
    }
    return this.args?.data;
  }
}
