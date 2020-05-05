/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A component that displays results for definitions
 */

import NaviBaseSearchResultComponent from './base';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

/**
 * @constant NUM_TOP
 */
const NUM_TOP:number = 2;

export default class NaviDefinitionSearchResultComponent extends NaviBaseSearchResultComponent {
  /**
   * @property {Ember.Service} metadataService
   */
  @service('bard-metadata') metadataService!: TODO;

  /**
   * @property {Boolean} showTop
   */
  @tracked showTop: Boolean = true;

  /**
   * @property {Boolean} hasMultipleDataSources
   */
  get hasMultipleDataSources(): Boolean {
    return this.metadataService.loadedDataSources.length > 1;
  }

  /**
   * @property {Boolean} hasMoreResults
   */
  get hasMoreResults(): Boolean {
    return this.args?.data.length > NUM_TOP;
  }

  /**
   * @property {Array} results
   */
  get results(): Array<Object> {
    if (this.showTop && this.hasMoreResults) {
      return this.args?.data.slice(0, NUM_TOP);
    }
    return this.args?.data;
  }
}
