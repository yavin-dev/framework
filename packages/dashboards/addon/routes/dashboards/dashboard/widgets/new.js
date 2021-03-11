/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { A } from '@ember/array';
import ReportsNewRoute from 'navi-reports/routes/reports/new';

export default class DashboardsDashboardWidgetsNewRoute extends ReportsNewRoute {
  /**
   * Transitions to newly created widget
   * @param widget - resolved widget model
   * @override
   */
  afterModel(widget) {
    return this.replaceWith('dashboards.dashboard.widgets.widget.edit', widget.tempId);
  }

  /**
   * Returns a new model for this route
   *
   * @private
   * @returns route model
   */
  _newModel() {
    const author = this.user.getUser();
    const defaultVisualization = this.naviVisualizations.defaultVisualization();
    const table = this._getDefaultTable();
    const dashboard = this.modelFor('dashboards.dashboard');

    const widget = this.store.createRecord('dashboard-widget', {
      author,
      dashboard,
      requests: A([
        this.store.createFragment('bard-request-v2/request', {
          table: table.id,
          dataSource: table.source,
        }),
      ]),
      visualization: { type: defaultVisualization },
    });

    return widget;
  }
}
