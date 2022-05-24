/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { getOwner } from '@ember/application';
import type { ClientServices, Injector } from 'navi-data/models/native-with-create';

export default class ClientInjector extends Service implements Injector {
  private owner = getOwner(this);
  lookup<T extends ClientServices>(type: 'service', name: T) {
    return this.owner.lookup(`${type}:${name}`);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'client-injector': ClientInjector;
  }
}
