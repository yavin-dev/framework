/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import ReportsReportViewRoute from 'navi-reports/routes/reports/report/view';
import type DashboardsDashboardWidgetsWidgetRoute from 'navi-dashboards/routes/dashboards/dashboard/widgets/widget';
import type { ModelFrom } from 'navi-core/utils/type-utils';

export default class DashboardsDashboardWidgetsWidgetViewRoute extends ReportsReportViewRoute {
  /**
   * object containing request to view
   */
  get parentModel() {
    return this.modelFor('dashboards.dashboard.widgets.widget') as ModelFrom<DashboardsDashboardWidgetsWidgetRoute>;
  }
}
