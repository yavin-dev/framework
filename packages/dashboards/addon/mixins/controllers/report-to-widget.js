/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  /**
   * @method _createWidget
   * @private
   * @param {DS.Model} report - report to create a widget from
   * @param {String} title - name of new widget
   * @returns {DS.Model} unsaved widget model
   */
  _createWidget(report, title) {
    let visualization = report.visualization.serialize();

    return this.store.createRecord('dashboard-widget', {
      title,
      requests: [report.request.clone()],
      visualization,
    });
  },

  actions: {
    /**
     * Creates a widget and adds it to an existing dashboard
     *
     * @action addToDashboard
     * @param {DS.Model} report - report to add
     * @param {Number} id - target dashboard id
     * @param {String} widgetTitle - name of new widget
     */
    addToDashboard(report, id, widgetTitle) {
      // Create widget model
      let widget = this._createWidget(report, widgetTitle);

      // Transition to widgets/new route
      this.transitionToRoute('dashboards.dashboard.widgets.add', id, {
        queryParams: {
          unsavedWidgetId: widget.tempId,
        },
      });
    },

    /**
     * Creates a widget and adds it to a new dashboard
     *
     * @action addToNewDashboard
     * @param {DS.Model} report - report to add
     * @param {String} dashboardTitle - name of new dashboard
     * @param {String} widgetTitle - name of new widget
     */
    addToNewDashboard(report, dashboardTitle, widgetTitle) {
      // Create widget model
      let widget = this._createWidget(report, widgetTitle);

      this.transitionToRoute('dashboards.new', {
        queryParams: {
          title: dashboardTitle,
          unsavedWidgetId: widget.tempId,
        },
      });
    },
  },
});
