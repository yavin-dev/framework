/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import type Controller from '@ember/controller';
import type ReportModel from 'navi-core/models/report';

export default Mixin.create({
  store: service('store'),

  /**
   * @param report - report to create a widget from
   * @param title - name of new widget
   * @returns unsaved widget model
   */
  _createWidget(report: ReportModel, title: string) {
    const { visualization } = report;

    const widget = this.get('store').createRecord('dashboard-widget', {
      title,
      requests: [report.request.clone()],
    });
    widget.updateVisualization(visualization.clone());
    return widget;
  },

  actions: {
    /**
     * Creates a widget and adds it to an existing dashboard
     * @param report - report to add
     * @param id - target dashboard id
     * @param widgetTitle - name of new widget
     */
    addToDashboard(report: ReportModel, id: number, widgetTitle: string) {
      // Create widget model
      let widget = this._createWidget(report, widgetTitle);

      // Transition to widgets/new route
      (this as unknown as Controller).transitionToRoute('dashboards.dashboard.widgets.add', id, {
        queryParams: {
          unsavedWidgetId: widget.tempId,
        },
      });
    },

    /**
     * Creates a widget and adds it to a new dashboard
     * @param report - report to add
     * @param dashboardTitle - name of new dashboard
     * @param widgetTitle - name of new widget
     */
    addToNewDashboard(report: ReportModel, dashboardTitle: string, widgetTitle: string) {
      // Create widget model
      let widget = this._createWidget(report, widgetTitle);

      (this as unknown as Controller).transitionToRoute('dashboards.new', {
        queryParams: {
          title: dashboardTitle,
          unsavedWidgetId: widget.tempId,
        },
      });
    },
  },
});
