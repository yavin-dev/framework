/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import ReplaceNull from 'navi-data/request-decorators/replace-null';

export default Service.extend({
  /**
   * @method applyGlobalDecorators
   * @param {Object} request - object to modify
   * @returns {Object} transformed version of request
   */
  applyGlobalDecorators(request) {
    return ReplaceNull.replaceNullFilter(request);
  }
});
