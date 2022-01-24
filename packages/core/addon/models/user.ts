/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Model, { hasMany, AsyncHasMany } from '@ember-data/model';
import ReportModel from './report';
import DeliveryRuleModel from './delivery-rule';
import DashboardModel from './dashboard';
import Role from './role';

export default class UserModel extends Model {
  @hasMany('report', { async: true, inverse: 'owner' })
  declare reports: AsyncHasMany<ReportModel>;

  @hasMany('report', { async: true, inverse: null })
  declare favoriteReports: AsyncHasMany<ReportModel>;

  @hasMany('delivery-rule', { async: true, inverse: 'owner' })
  declare deliveryRules: AsyncHasMany<DeliveryRuleModel>;

  @hasMany('dashboard', { async: true, inverse: 'owner' })
  declare dashboards: AsyncHasMany<DashboardModel>;

  @hasMany('dashboard', { async: true, inverse: 'editors' })
  declare editingDashboards: AsyncHasMany<DashboardModel>;

  @hasMany('dashboard', { async: true, inverse: null })
  declare favoriteDashboards: AsyncHasMany<DashboardModel>;

  @hasMany('role', { async: true })
  declare roles: AsyncHasMany<Role>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: UserModel;
  }
}
