/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
declare module 'navi-config' {
  import { NaviConfig } from '@yavin/client/config/datasources';
  export default interface NaviDataConfig extends NaviConfig {
    availability?: {
      timeoutMs?: number;
      cacheMs?: number;
    };
    dataEpoch: string;
  }
}
