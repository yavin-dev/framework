/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class DashboardPrintViewRoute extends Route {
  /**
   * @property {Ember.Service} dashboardData
   */
  @service dashboardData;
  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @method model
   * @override
   */
  async model() {
    const dashboard = this.modelFor('dashboards-print.dashboards.dashboard');
    const widgetsData = await this.dashboardData.fetchDataForDashboard(dashboard);
    return { dashboard, taskByWidget: widgetsData.taskByWidget };
  }
}
