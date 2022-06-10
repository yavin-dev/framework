/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { ClientConfig } from './config/datasources.js';
import type { NaviConfig } from './config/datasources.js';

export class Client {
  clientConfig: ClientConfig;
  constructor(clientConfig: NaviConfig) {
    this.clientConfig = new ClientConfig(clientConfig);
  }
}
