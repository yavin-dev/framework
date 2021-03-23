/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for definitions stored in the metadata.
 */
import NaviBaseSearchProviderService from '../navi-base-search-provider';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
//@ts-ignore
import { searchRecordsByFields } from 'navi-core/utils/search';
import type { TaskGenerator } from 'ember-concurrency';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { MetadataModelTypes } from 'navi-data/services/navi-metadata';

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
  @task({ restartable: true })
  *search(query: string): TaskGenerator<TODO> {
    const types: MetadataModelTypes[] = ['table', 'dimension', 'metric', 'timeDimension'];
    const kegData: TODO = [];
    let data = [];

    if (query?.length > 0) {
      types.forEach((type) => kegData.push(...this.naviMetadata.all(type).toArray()));
      data = searchRecordsByFields(kegData, query, ['id', 'name', 'description']);
    }

    return yield {
      component: this.displayComponentName,
      title: 'Definition',
      data: data.slice(0, this.resultThreshold),
    };
  }
}
