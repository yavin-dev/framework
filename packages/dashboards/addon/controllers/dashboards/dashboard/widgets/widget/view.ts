/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportsReportViewController from 'navi-reports/controllers/reports/report/view';
import { inject as controller } from '@ember/controller';
import type DashboardsDashboardWidgetsWidgetController from 'navi-dashboards/controllers/dashboards/dashboard/widgets/widget';

export default class DashboardsDashboardWidgetsWidgetViewController extends ReportsReportViewController {
  @controller('dashboards.dashboard.widgets.widget')
  declare reportController: DashboardsDashboardWidgetsWidgetController;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'dashboards.dashboard.widgets.widget.view': DashboardsDashboardWidgetsWidgetViewController;
  }
}
