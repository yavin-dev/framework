/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for definitions stored in the metadata.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from '../navi-base-search-provider';
//@ts-ignore
import { task } from 'ember-concurrency';
//@ts-ignore
import { searchRecordsByFields } from 'navi-core/utils/search';
import NaviMetadataService, { MetadataModelTypes } from 'navi-data/services/navi-metadata';

export default class NaviDefinitionSearchProviderService extends NaviBaseSearchProviderService {
  @service
  private naviMetadata!: NaviMetadataService;

  /**
   * @property {String} _displayComponentName
   * @private
   */
  private displayComponentName = 'navi-search-result/definition';

  /**
   * @method search – Searches for definitions in the metadata
   * @param {String} query
   * @returns {Object} Object containing, component, title and data
   */
  // eslint-disable-next-line require-yield
  @(task(function* (this: NaviDefinitionSearchProviderService, query: TODO) {
    const types: MetadataModelTypes[] = ['table', 'dimension', 'metric', 'timeDimension'];
    const kegData: TODO = [];
    let data = [];

    if (query?.length > 0) {
      types.forEach((type) => kegData.push(...this.naviMetadata.all(type).toArray()));
      data = searchRecordsByFields(kegData, query, ['id', 'name', 'description']);
    }

    return {
      component: this.displayComponentName,
      title: 'Definition',
      data: data.slice(0, this.resultThreshold),
    };
  }).restartable())
  search: TODO;
}
