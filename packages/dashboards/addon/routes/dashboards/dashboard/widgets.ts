/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type { ModelFrom } from 'navi-core/utils/type-utils';

export default class DashboardsDashboardWidgetsRoute extends Route {
  /**
   * @returns Promise that resolves to a DS.RecordArray of Widgets
   */
  model() {
    const dashboardsDashboardModel = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    return dashboardsDashboardModel.widgets;
  }
}
