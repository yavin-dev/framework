/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Debugger } from 'debug';

declare module './registry' {
  export default interface ServiceRegistry {
    logger: Debugger;
  }
}
