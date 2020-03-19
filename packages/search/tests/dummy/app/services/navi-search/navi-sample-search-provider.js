/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * This is a sample search provider.
 */

import NaviBaseSearchProviderService from '../navi-base-search-provider';
import { keepLatestTask } from 'ember-concurrency-decorators';

export default class NaviSampleSearchProviderService extends NaviBaseSearchProviderService {
  /**
   * @method search – Sample search method
   * @param {String} query
   * @returns {Object} Object containing results and dislay component
   */
  @keepLatestTask
  *search(query) {
    let data = yield new Promise(function(resolve) {
      let payload = [];
      if (query.toLowerCase().includes('revenue')) {
        payload = ['Revenue result', 'Revenue success'];
      }
      resolve(payload);
    });
    return {
      component: 'navi-search-result/sample',
      title: 'Sample',
      data
    };
  }
}
