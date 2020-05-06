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
  data: Array<Object>;
}

export default class NaviBaseSearchResultComponent extends Component<Args> {
  /**
   * @property {Boolean} showTop
   */
  @tracked showTop: Boolean = true;

  /**
   * @property {number} numberOfTopResults
   */
  numberOfTopResults: number = 10;

  /**
   * @property {Boolean} hasMoreResults
   */
  get hasMoreResults(): Boolean {
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
