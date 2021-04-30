/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import type { ModelFrom } from 'navi-core/utils/type-utils';
import type DashboardPrintDashboardsDashboardRoute from 'navi-dashboards/routes/dashboards-print/dashboards/dashboard';

export default class DashboardPrintDashboardsDashboardIndexRoute extends Route {
  redirect() {
    const { id } = this.modelFor(
      'dashboards-print.dashboards.dashboard'
    ) as ModelFrom<DashboardPrintDashboardsDashboardRoute>;
    this.replaceWith('dashboards-print.dashboards.dashboard.view', id);
  }
}
