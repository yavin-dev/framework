/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import NativeWithCreate from '../models/native-with-create.js';
import type { RequestV2 } from '../request.js';
import type RequestDecoratorServiceInterface from './interfaces/request-decorator.js';

export default class RequestDecoratorService extends NativeWithCreate implements RequestDecoratorServiceInterface {
  /**
   * @param request - object to modify
   * @returns transformed version of request
   */
  applyGlobalDecorators(request: RequestV2): RequestV2 {
    return request;
  }
}
