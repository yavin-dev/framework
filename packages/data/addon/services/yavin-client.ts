/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Service from '@ember/service';
import { Client } from '@yavin/client';
import config from 'ember-get-config';

export default class YavinClientService extends Service {
  private client: Client;
  constructor() {
    super(...arguments);
    this.client = new Client(config.navi);
  }

  get clientConfig() {
    return this.client.clientConfig;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'yavin-client': YavinClientService;
  }
}
