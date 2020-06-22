/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This service is used to search for definitions stored in the metadata.
 */

import { inject as service } from '@ember/service';
import NaviBaseSearchProviderService from '../navi-base-search-provider';
import { task } from 'ember-concurrency';
import { searchRecordsByFields } from 'navi-core/utils/search';

export default class NaviDefinitionSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @property {Ember.Service} metadataService
   */
  @service('bard-metadata') metadataService;

  /**
   * @property {String} _displayComponentName
   * @private
   */
  _displayComponentName = 'navi-search-result/definition';

  /**
   * @method search – Searches for definitions in the metadata
   * @param {String} query
   * @returns {Object} Object containing, component, title and data
   */
  // eslint-disable-next-line require-yield
  @(task(function*(query) {
    const types = ['table', 'dimension', 'metric', 'time-dimension'];
    const kegData = [];
    let data = [];

    if (query?.length > 0) {
      types.forEach(type => kegData.push(...this.metadataService.all(type)));
      data = searchRecordsByFields(kegData, query, ['id', 'name', 'description']);
    }

    return {
      component: this._displayComponentName,
      title: 'Definition',
      data: data.slice(0, this.resultThreshold)
    };
  }).restartable())
  search;
}
