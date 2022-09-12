/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import type { DeliveryRule } from './delivery-rule';
import type { BelongsTo, HasMany, JSONApiDef } from './json-api';
import type { User } from './user';
import type { DashboardWidget } from './dashboard-widget';
import type { ColumnType, Filter, FilterOperator } from '@yavin/client/request';

export type Dashboard = JSONApiDef<
  'dashboards',
  {
    title: string;
    createdOn: string;
    updatedOn: string;
    filters: Array<{
      dimension: string;
      operator: FilterOperator;
      values: Filter['values'];
      field: string;
      type?: ColumnType;
    }>;
    presentation: {
      version: 1;
      columns: number;
      layout: Array<{
        column: number;
        row: number;
        height: number;
        width: number;
        widgetId: number;
      }>;
    };
  },
  {
    deliveryRules: HasMany<DeliveryRule>;
    editors: HasMany<User>;
    owner: BelongsTo<User>;
    widgets: HasMany<DashboardWidget>;
  }
>;
