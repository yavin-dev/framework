/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { computed, get, set, setProperties } from '@ember/object';
import { A as arr, makeArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { copy } from '@ember/object/internals';
import { all } from 'rsvp';

export default Route.extend({
  /**
   * @property {Service} user
   */
  user: service(),

  /**
   * @property {DS.Model} currentDashboard - current dashboard model
   */
  currentDashboard: computed(function() {
    return this.modelFor(this.routeName);
  }).volatile(),

  /**
   * @property {Service} naviNotifications
   */
  naviNotifications: service(),

  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @method model
   * @override
   * @param {Object} param
   * @param {String} param.dashboardId - id of dashboard
   * @returns {Promise} Promise that resolves to a dashboard model
   *
   */
  model({ dashboard_id }) {
    return get(this, 'store').find('dashboard', dashboard_id);
  },

  /**
   * Updates the dashboard layout property given a list of dashboard items
   * that have changed
   *
   * @method _updateLayout
   * @private
   * @param {Array} updatedWidgets - list of widgets that have changed
   * @return {Void}
   */
  _updateLayout(updatedWidgets) {
    const dashboard = get(this, 'currentDashboard');
    const newLayout = copy(get(dashboard, 'presentation.layout'), true);

    makeArray(updatedWidgets).forEach(updatedWidget => {
      let modelWidget = arr(newLayout).findBy('widgetId', Number(updatedWidget.id));

      //Make sure the widget is still a member of the dashboard
      if (modelWidget) {
        let { y: row, x: column, height, width } = updatedWidget;
        setProperties(modelWidget, { column, row, height, width });
      }
    });

    set(dashboard, 'presentation.layout', newLayout);
  },

  /**
   * Method used by saveDashboard action to save the
   * dashboard model
   *
   * @method _saveDashboardFn
   * @private
   * @return {Void}
   */
  _saveDashboardFn() {
    const dashboard = get(this, 'currentDashboard');
    const widgets = get(this, 'currentDashboard.widgets');

    return dashboard
      .save()
      .then(widgets.map(widget => widget.save()))
      .catch(() => {
        get(this, 'naviNotifications').add({
          message: 'OOPS! An error occured while trying to save your dashboard.',
          type: 'danger',
          timeout: 'short'
        });
      });
  },

  /**
   * Notifies user about errors
   *
   * @method showErrorNotification
   * @param {String} message - The notification error message to be displayed
   * @returns {Void}
   */
  showErrorNotification(message) {
    get(this, 'naviNotifications').add({
      message: message,
      type: 'danger',
      timeout: 'medium'
    });
  },

  actions: {
    /**
     * @action didUpdateLayout - updates dashboard's layout property and save it
     * @param {Event} event - event object
     * @param {Array} [widgets] - Array of widgets that updated
     */
    didUpdateLayout(event, widgets) {
      if (widgets && get(widgets, 'length')) {
        this.set('_stagedLayout', widgets);
      }
    },

    commitStagedLayout() {
      this._updateLayout(this.get('_stagedLayout'));
    },

    /**
     * @action saveDashboard - saves dashboard updates
     */
    saveDashboard() {
      this._saveDashboardFn();
    },

    /**
     * @action deleteWidget
     * @param {DS.Model} widgetModel - object to delete
     */
    deleteWidget(widgetModel) {
      const id = get(widgetModel, 'id');

      widgetModel.deleteRecord();

      // Remove layout reference
      const presentation = get(this, 'currentDashboard.presentation');
      const newLayout = arr(get(presentation, 'layout')).rejectBy('widgetId', Number(id));

      set(presentation, 'layout', newLayout);

      return this.transitionTo('dashboards.dashboard', this.get('currentDashboard.id'));
    },

    /**
     * @action toggleFavorite - toggles favorite dashboard
     */
    toggleFavorite(dashboard) {
      let user = get(this, 'user').getUser(),
        isFavorite = get(dashboard, 'isFavorite'),
        updateOperation = isFavorite ? 'removeObject' : 'addObject',
        rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

      get(user, 'favoriteDashboards')[updateOperation](dashboard);
      user.save().catch(() => {
        //manually rollback - fix once ember-data has a way to rollback relationships
        get(user, 'favoriteDashboards')[rollbackOperation](dashboard);
        this.showErrorNotification('OOPS! An error occurred while updating favorite dashboards');
      });
    },

    /**
     * @action updateTitle
     *
     * Updates dashboard model's title, unless new title is empty
     * @param {String} title
     */
    updateTitle(title) {
      if (!isEmpty(title)) {
        let dashboard = get(this, 'currentDashboard');
        set(dashboard, 'title', title);
      }
    },

    /**
     * Revert the dashboard.
     *
     * @action revertDashboard
     */
    revertDashboard() {
      const dashboard = get(this, 'currentDashboard');
      return dashboard.rollbackAttributes();
    }
  }
});
