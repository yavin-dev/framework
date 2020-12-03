/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';

export default class DashboardsPrintDashboardsDashboard extends Controller {
  queryParams = ['layout'];

  layout = 'single-column';

  get isSingleColumn(): boolean {
    return this.layout.toLowerCase() === 'single-column';
  }

  get isGrid(): boolean {
    return this.layout.toLowerCase() === 'grid';
  }
}

declare module '@ember/controller' {
  interface Registry {
    'dashboards-print/dashboards/dashboard/view': DashboardsPrintDashboardsDashboard;
  }
}
