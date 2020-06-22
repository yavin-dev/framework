/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A component that displays results for definitions
 */

import NaviBaseSearchResultComponent from './base';
import { inject as service } from '@ember/service';

/**
 * @constant NUM_TOP
 */
const NUM_TOP: number = 2;

export default class NaviDefinitionSearchResultComponent extends NaviBaseSearchResultComponent {
  /**
   * @property {Ember.Service} metadataService
   */
  @service('bard-metadata') metadataService!: TODO;

  /**
   * @override
   * @property {number} numberOfTopResults
   */
  numberOfTopResults: number = NUM_TOP;

  /**
   * @property {boolean} hasMultipleDataSources
   */
  get hasMultipleDataSources(): boolean {
    return this.metadataService.loadedDataSources.length > 1;
  }
}
