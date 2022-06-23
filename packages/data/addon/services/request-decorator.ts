/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import RequestDecoratorService from '@yavin/client/services/request-decorator';
import { getOwner } from '@ember/application';

export default class NaviRequestDecoratorService extends RequestDecoratorService {
  static create(args: unknown) {
    const owner = getOwner(args);
    const yavinClient = owner.lookup('service:yavin-client');
    return new this(yavinClient.injector);
  }
}

declare module '@ember/service' {
  interface Registry {
    'request-decorator': RequestDecoratorService;
  }
}
