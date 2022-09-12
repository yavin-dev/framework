/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Request } from '@yavin/client/request';
import type { Visualization } from './visualization';
import type { JSONApiDef, BelongsTo } from './json-api';
import type { Dashboard } from './dashboard';
import type { User } from './user';

export type DashboardWidget = JSONApiDef<
  'dashboardWidgets',
  {
    title: string;
    createdOn: string;
    updatedOn: string;
    visualization: Visualization;
    requests: Request[];
  },
  {
    dashboard: BelongsTo<Dashboard>;
    owner: BelongsTo<User>;
  }
>;
