/**
 * Copyright 2017, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Ember from 'ember';

const { get, set } = Ember;

export default Ember.Route.extend({
  /**
   * @property {Service} user
   */
  user: Ember.inject.service(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: Ember.inject.service(),

  /**
   * Sets the model for this route
   *
   * @method model
   * @override
   * @returns {DS.Model} dashboard model
   */
  model() {
    let dashboard = this.modelFor('dashboards.dashboard');
    return this._cloneDashboard(dashboard);
  },

  /**
   * Transitions to dashboard
   *
   * @method afterModel
   * @param dashboard - resolved dashboard model
   * @override
   */
  afterModel(dashboard) {
    return this.replaceWith('dashboards.dashboard', get(dashboard, 'id'));
  },

  /**
   * Clones the dashboard model object
   *
   * @method _cloneDashboard
   * @private
   * @param dashboardModel - The dashboard Model that needs to be cloned
   * @returns {DS.Promise} dashboard promise
   */
  _cloneDashboard(dashboardModel) {
    let cloneDashboard = dashboardModel.clone();
    set(
      cloneDashboard,
      'title',
      `Copy of ${get(cloneDashboard, 'title')}`.substring(0, 150)
    );

    return cloneDashboard.save().then(cloneDashboardModel =>
      this._cloneWidgets(dashboardModel, cloneDashboardModel).then(
        widgetPromiseArray =>
          Ember.RSVP.all(widgetPromiseArray).then(newWidgets => {
            let layout = cloneDashboardModel.get('presentation.layout');

            //Replace original widget IDs with newly cloned widget IDs
            newWidgets.forEach((widget, idx) => {
              set(layout[idx], 'widgetId', Number(widget.id));
            });
            return cloneDashboardModel.save();
          })
      )
    );
  },

  /**
   * Clones the widgets for a dashboard
   *
   * @method _cloneWidgets
   * @private
   * @param dashboardModel - The dashboard Model that needs to be cloned
   * @param cloneDashboardModel - The Cloned dashboard Model
   * @returns {DS.PromiseArray} - Array of widget promises ordered to match dashboard layout array
   */
  _cloneWidgets(dashboardModel, cloneDashboardModel) {
    return dashboardModel.get('widgets').then(widgets => {
      let widgetsById = [];
      widgets.forEach(rec => (widgetsById[rec.id] = rec));

      return cloneDashboardModel.get('presentation.layout').map(item => {
        let widget = widgetsById[item.widgetId],
          cloneWidget = widget.clone();

        cloneWidget.set('dashboard', cloneDashboardModel);
        return cloneWidget.save();
      });
    });
  },

  actions: {
    /**
     * @action error
     * action to handle errors in route
     */
    error() {
      let message = 'OOPS! An error occurred while cloning the dashboard.';
      get(this, 'naviNotifications').add({
        message,
        type: 'danger',
        timeout: 'short'
      });
      this.replaceWith('dashboards');
    }
  }
});
