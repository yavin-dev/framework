/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Mixin from '@ember/object/mixin';

import { computed, get } from '@ember/object';

export default Mixin.create({
  /**
   * @property {DS.Model} currentReport - current report model
   */
  currentReport: computed(function() {
    return this.modelFor(this.routeName);
  }).volatile(),

  /**
   * @method _createWidget
   * @private
   * @param {String} title - name of new widget
   * @returns {DS.Model} unsaved widget model
   */
  _createWidget(title) {
    let visualization = get(this, 'currentReport.visualization').serialize();

    return get(this, 'store').createRecord('dashboard-widget', {
      title,
      requests: [get(this, 'currentReport.request').clone()],
      visualization
    });
  },

  actions: {
    /**
     * Creates a widget and adds it to an existing dashboard
     *
     * @action addToDashboard
     * @param {Number} id - target dashboard id
     * @param {String} widgetTitle - name of new widget
     */
    addToDashboard(id, widgetTitle) {
      // Create widget model
      let widget = this._createWidget(widgetTitle);

      // Transition to widgets/new route
      this.transitionTo('dashboards.dashboard.widgets.add', id, {
        queryParams: {
          unsavedWidgetId: get(widget, 'tempId')
        }
      });
    },

    /**
     * Creates a widget and adds it to a new dashboard
     *
     * @action addToNewDashboard
     * @param {String} dashboardTitle - name of new dashboard
     * @param {String} widgetTitle - name of new widget
     */
    addToNewDashboard(dashboardTitle, widgetTitle) {
      // Create widget model
      let widget = this._createWidget(widgetTitle);

      this.transitionTo('dashboards.new', {
        queryParams: {
          title: dashboardTitle,
          unsavedWidgetId: get(widget, 'tempId')
        }
      });
    }
  }
});
