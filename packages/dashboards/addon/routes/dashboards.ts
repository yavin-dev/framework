/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class DashboardsRoute extends Route {
  /**
   * @property {Service} naviNotifications
   */
  @service() naviNotifications!: TODO;
}
