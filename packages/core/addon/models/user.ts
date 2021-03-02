/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import DS from 'ember-data';
import Model, { hasMany } from '@ember-data/model';
import ReportModel from './report';
import DeliveryRuleModel from './delivery-rule';
import DashboardModel from './dashboard';
import Role from './role';

export default class UserModel extends Model {
  @hasMany('report', { async: true, inverse: 'author' })
  reports!: DS.PromiseManyArray<ReportModel>;

  @hasMany('report', { async: true, inverse: null })
  favoriteReports!: DS.PromiseManyArray<ReportModel>;

  @hasMany('delivery-rule', { async: true, inverse: 'owner' })
  deliveryRules!: DS.PromiseManyArray<DeliveryRuleModel>;

  @hasMany('dashboard', { async: true, inverse: 'author' })
  dashboards!: DS.PromiseManyArray<DashboardModel>;

  @hasMany('dashboard', { async: true, inverse: null })
  favoriteDashboards!: DS.PromiseManyArray<DashboardModel>;

  @hasMany('role', { async: true })
  roles!: DS.PromiseManyArray<Role>;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: UserModel;
  }
}
