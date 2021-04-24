/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import type { ModelFrom } from 'navi-core/utils/type-utils';
import type DashboardPrintDashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type DashboardDataService from 'navi-dashboards/services/dashboard-data';

export default class DashboardPrintViewRoute extends Route {
  @service
  declare dashboardData: DashboardDataService;

  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   */
  async model() {
    const dashboard = this.modelFor(
      'dashboards-print.dashboards.dashboard'
    ) as ModelFrom<DashboardPrintDashboardsDashboardRoute>;
    const widgetsData = await this.dashboardData.fetchDataForDashboard(dashboard);
    return { dashboard, taskByWidget: widgetsData };
  }
}
