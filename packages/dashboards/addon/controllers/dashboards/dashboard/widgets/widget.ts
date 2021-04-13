/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportsReportController from 'navi-reports/controllers/reports/report';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import type DashboardsDashboardController from 'navi-dashboards/controllers/dashboards/dashboard';

export default class DashboardsDashboardWidgetsWidgetController extends ReportsReportController {
  @controller('dashboards.dashboard') declare dashboard: DashboardsDashboardController;

  /**
   * Used to store query parameters from the parent route
   */
  @alias('dashboard.queryCache') parentQueryParams!: DashboardsDashboardController['queryCache'];
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'dashboards.dashboard.widgets.widget': DashboardsDashboardWidgetsWidgetController;
  }
}
