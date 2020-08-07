/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * A component that displays results for definitions
 */

import NaviBaseSearchResultComponent from './base';
import { inject as service } from '@ember/service';
import NaviMetadataService from 'navi-data/addon/services/navi-metadata';

/**
 * @constant NUM_TOP
 */
const NUM_TOP: number = 2;

export default class NaviDefinitionSearchResultComponent extends NaviBaseSearchResultComponent {
  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @override
   * @property {number} numberOfTopResults
   */
  numberOfTopResults: number = NUM_TOP;

  /**
   * @property {boolean} hasMultipleDataSources
   */
  get hasMultipleDataSources(): boolean {
    return this.naviMetadata.loadedDataSources.size > 1;
  }
}
