/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Request } from '@yavin/client/request';
import type { DeliveryRule } from './delivery-rule';
import type { BelongsTo, HasMany, JSONApiDef } from './json-api';
import type { User } from './user';
import type { Visualization } from './visualization';

export type Report = JSONApiDef<
  'reports',
  {
    title: string;
    createdOn: string;
    updatedOn: string;
    visualization: Visualization;
    request: Request;
  },
  {
    deliveryRules: HasMany<DeliveryRule>;
    owner: BelongsTo<User>;
  }
>;
