/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportsReportController from 'navi-reports/controllers/reports/report';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import type DashboardsDashboardController from 'navi-dashboards/controllers/dashboards/dashboard';
import { ModelFrom } from 'navi-core/utils/type-utils';
import DashboardsDashboardWidgetsWidgetRoute from 'navi-dashboards/routes/dashboards/dashboard/widgets/widget';

export default class DashboardsDashboardWidgetsWidgetController extends ReportsReportController {
  declare model: ModelFrom<DashboardsDashboardWidgetsWidgetRoute>;
  @controller('dashboards.dashboard') declare dashboard: DashboardsDashboardController;

  /**
   * Used to store query parameters from the parent route
   */
  @alias('dashboard.queryCache') parentQueryParams!: DashboardsDashboardController['queryCache'];

  get dataSources() {
    const dataSources = [...this.model.requests.toArray().flatMap((request) => request.dataSource)].filter(Boolean);
    return dataSources.length ? dataSources : undefined;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'dashboards.dashboard.widgets.widget': DashboardsDashboardWidgetsWidgetController;
  }
}
