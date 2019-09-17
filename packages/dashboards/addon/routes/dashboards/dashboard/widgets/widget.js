/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import ReportRoute from 'navi-reports/routes/reports/report';

export default ReportRoute.extend({
  /**
   * @method model
   * @param {Object} params
   * @param {String} params.widgetId - persisted id or temp id of widget to fetch
   * @returns {DS.Model} model for requested widget
   */
  model({ widget_id }) {
    let widgets = this.modelFor('dashboards.dashboard.widgets'),
      widgetModel = widgets.findBy('id', widget_id) || this._findTempWidget(widget_id);

    if (widgetModel) {
      return widgetModel;
    }

    throw new Error(`Widget ${widget_id} could not be found`);
  },

  /**
   * @method _findTempWidget
   * @private
   * @param {String} id - temp id of local widget
   * @returns {DS.Model} widget with matching temp id
   */
  _findTempWidget(id) {
    return this.store.peekAll('dashboard-widget').findBy('tempId', id);
  },

  actions: {
    /**
     * @action saveWidget
     * @param {DS.Model} widget - object to save
     */
    saveWidget(widget) {
      let tempId = get(widget, 'tempId');

      // When saving a widget for the first time, we need to add it to the dashboard
      if (tempId) {
        this.transitionTo('dashboards.dashboard.widgets.add', {
          queryParams: {
            unsavedWidgetId: tempId
          }
        });
      } else {
        widget
          .save()
          .then(() => {
            get(this, 'naviNotifications').add({
              message: 'Widget was successfully saved!',
              type: 'success',
              timeout: 'short'
            });

            // Refresh the parent route to have the latest widget changes
            getOwner(this)
              .lookup('route:dashboards/dashboard')
              .refresh();
          })
          .catch(() => {
            get(this, 'naviNotifications').add({
              message: 'OOPS! An error occurred while saving',
              type: 'danger',
              timeout: 'medium'
            });
          });
      }
    }
  }
});
