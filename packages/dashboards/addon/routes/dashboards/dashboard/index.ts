/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Route from '@ember/routing/route';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type { ModelFrom } from 'navi-core/utils/type-utils';

export default class DashboardsDashboardIndexRoute extends Route {
  /**
   * @override
   */
  redirect() {
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    this.replaceWith('dashboards.dashboard.view', dashboard.id);
  }
}
