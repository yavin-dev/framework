/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

export default class RequestDecoratorService extends Service {
  /**
   * @param request - object to modify
   * @returns transformed version of request
   */
  applyGlobalDecorators(request: RequestV2): RequestV2 {
    return request;
  }
}

declare module '@ember/service' {
  interface Registry {
    'request-decorator': RequestDecoratorService;
  }
}
