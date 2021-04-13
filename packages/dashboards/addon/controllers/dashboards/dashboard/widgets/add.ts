/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Controller from '@ember/controller';

export default class DashboardsDashboardWidgetsAddController extends Controller {
  queryParams = ['unsavedWidgetId'];

  /**
   * uuid of unsaved widget
   */
  unsavedWidgetId = '';
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'dashboards.dashboard.widgets.add': DashboardsDashboardWidgetsAddController;
  }
}
