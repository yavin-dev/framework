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
    let result = yield new Promise(function(resolve) {
      setTimeout(function() {
        let data = [];
        if (query.includes('Revenue')) {
          data = ['Revenue result', 'Revenue success'];
        }
        resolve({
          component: 'navi-search-result/sample',
          data
        });
      }, 300);
    });
    return result;
  }
}
