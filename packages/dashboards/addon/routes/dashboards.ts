/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';

export default class DashboardsRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;
}
