/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { Dashboard } from './dashboard';
import type { HasMany, JSONApiDef } from './json-api';
import type { Report } from './report';
import type { Role } from './role';

export type User = JSONApiDef<
  'users',
  {
    createdOn: string;
    updatedOn: string;
  },
  {
    dashboards: HasMany<Dashboard>;
    editingDashboards: HasMany<Dashboard>;
    favoriteDashboards: HasMany<Dashboard>;
    favoriteReports: HasMany<Report>;
    reports: HasMany<Report>;
    roles: HasMany<Role>;
  }
>;
