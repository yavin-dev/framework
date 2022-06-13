/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import type { ClientServices, Injector, LookupType } from '@yavin/client/models/native-with-create';
import type YavinClientService from './yavin-client';

export default class ClientInjector extends Service implements Injector {
  @service
  declare yavinClient: YavinClientService;

  private owner = getOwner(this);
  lookup<T extends ClientServices>(type: LookupType, name?: T) {
    if (type === 'config') {
      return this.yavinClient.clientConfig;
    }
    return this.owner.lookup(`${type}:${name}`);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'client-injector': ClientInjector;
  }
}
