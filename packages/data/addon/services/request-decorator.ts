/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { replaceNullFilter } from '../request-decorators/replace-null';

export default class RequestDecoratorService extends Service {
  /**
   * @method applyGlobalDecorators
   * @param {Object} request - object to modify
   * @returns {Object} transformed version of request
   */
  applyGlobalDecorators(request: TODO) {
    return replaceNullFilter(request);
  }
}
