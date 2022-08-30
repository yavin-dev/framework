/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { JSONApiDef } from './json-api';

export type Role = JSONApiDef<
  'roles',
  {
    createdOn: string;
    updatedOn: string;
  }
>;
