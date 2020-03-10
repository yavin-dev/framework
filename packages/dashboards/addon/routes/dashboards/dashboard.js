/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action, set, setProperties } from '@ember/object';
import { A as arr, makeArray } from '@ember/array';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default class DashboardsDashboardRoute extends Route {
  /**
   * @property {Service} user
   */
  @service user;

  /**
   * @property {DS.Model} currentDashboard - current dashboard model
   */
  get currentDashboard() {
    return this.modelFor(this.routeName);
  }

  /**
   * @property {Service} naviNotifications
   */
  @service naviNotifications;

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
    return this.store.find('dashboard', dashboard_id);
  }

  /**
   * Updates the dashboard layout property given a list of dashboard items
   * that have changed
   *
   * @method _updateLayout
   * @param {Array} updatedWidgets - list of widgets
   * @private
   * @return {Void}
   */
  _updateLayout(updatedWidgets) {
    const { currentDashboard } = this;
    const layout = currentDashboard?.presentation?.layout;

    makeArray(updatedWidgets).forEach(updatedWidget => {
      let modelWidget = layout.find(widget => widget.get('widgetId') === Number(updatedWidget.id));

      //Make sure the widget is still a member of the dashboard
      if (modelWidget) {
        let { y: row, x: column, height, width } = updatedWidget;
        setProperties(modelWidget, { column, row, height, width });
      }
    });
  }

  /**
   * Notifies user about errors
   *
   * @method showErrorNotification
   * @param {String} message - The notification error message to be displayed
   * @returns {Void}
   */
  showErrorNotification(message) {
    this.naviNotifications.add({
      message: message,
      type: 'danger',
      timeout: 'medium'
    });
  }

  /**
   * @override
   * @method deactivate - reset query params on exit of route
   */
  deactivate() {
    super.deactivate(...arguments);
    const dashboard = this.modelFor(this.routeName);
    // don't rollback attributes if dashboard was unloaded.
    if (dashboard.isEmpty !== true) {
      dashboard.rollbackAttributes();
    }
  }

  /**
   * If traveling to the same route as the current dashboard, cache the query for breadcrumb purposes
   * @param {Transition} transition
   */
  cacheQuery(transition) {
    const controller = this.controllerFor(this.routeName);
    if (transition.from && transition.from.queryParams) {
      const fromRoute = transition.from.find(info => info.paramNames.includes('dashboard_id'));
      const fromDashboardId = fromRoute ? fromRoute.params.dashboard_id : null;
      const toRoute = transition.to && transition.to.find(info => info.paramNames.includes('dashboard_id'));
      const toDashboardId = toRoute ? toRoute.params.dashboard_id : null;

      if (fromDashboardId === toDashboardId) {
        controller.set('queryCache', transition.from.queryParams);
        return;
      }
    }
    this.controller.set('queryCache', null);
  }

  /**
   * @action didUpdateLayout - updates dashboard's layout property and save it
   * @param {Event} event - event object
   * @param {Array} [widgets] - Array of widgets that updated
   */
  @action
  didUpdateLayout(event, widgets) {
    this._updateLayout(widgets);
  }

  /**
   * @action saveDashboard - saves dashboard updates
   */
  @action
  saveDashboard() {
    const { currentDashboard } = this;
    const widgets = currentDashboard?.widgets;

    return currentDashboard
      .save()
      .then(all(widgets.map(async widget => widget.hasDirtyAttributes && widget.save())))
      .catch(() => {
        this.naviNotifications.add({
          message: 'OOPS! An error occured while trying to save your dashboard.',
          type: 'danger',
          timeout: 'short'
        });
      });
  }

  /**
   * @action deleteWidget
   * @param {DS.Model} widgetModel - object to delete
   */
  @action
  deleteWidget(widgetModel) {
    const { id } = widgetModel;

    widgetModel.deleteRecord();

    // Remove layout reference
    const presentation = this.currentDashboard?.presentation;
    const newLayout = arr(presentation.layout).rejectBy('widgetId', Number(id));

    set(presentation, 'layout', newLayout);

    return this.transitionTo('dashboards.dashboard', this.get('currentDashboard.id'));
  }

  /**
   * @action toggleFavorite - toggles favorite dashboard
   */
  @action
  toggleFavorite(dashboard) {
    const user = this.user.getUser();
    const { isFavorite } = dashboard;
    const updateOperation = isFavorite ? 'removeObject' : 'addObject';
    const rollbackOperation = isFavorite ? 'addObject' : 'removeObject';

    user.favoriteDashboards[updateOperation](dashboard);
    user.save().catch(() => {
      //manually rollback - fix once ember-data has a way to rollback relationships
      user.favoriteDashboards[rollbackOperation](dashboard);
      this.showErrorNotification('OOPS! An error occurred while updating favorite dashboards');
    });
  }

  /**
   * @action updateTitle
   *
   * Updates dashboard model's title, unless new title is empty
   * @param {String} title
   */
  @action
  updateTitle(title) {
    if (!isEmpty(title)) {
      const { currentDashboard } = this;
      set(currentDashboard, 'title', title);
    }
  }

  /**
   * Revert the dashboard.
   *
   * @action revertDashboard
   */
  @action
  revertDashboard() {
    const { currentDashboard } = this;
    currentDashboard.widgets.forEach(widget => widget.rollbackAttributes());
    currentDashboard.rollbackAttributes();
  }

  /**
   * Prompts user if they are leaving the route with unsaved changes.
   * @param {Transition} transition
   */
  @action
  willTransition(transition) {
    //subroute cache queryString and continue
    if (transition.targetName.startsWith(this.routeName)) {
      this.cacheQuery(transition);
      return true;
    }

    const { currentDashboard } = this;

    const isDirty =
      currentDashboard.get('hasDirtyAttributes') ||
      currentDashboard.get('filters.hasDirtyAttributes') ||
      currentDashboard.get('presentation.hasDirtyAttributes');

    if (
      isDirty &&
      currentDashboard.get('canUserEdit') &&
      !confirm('You have unsaved changes, are you sure you want to exit?')
    ) {
      transition.abort();
    } else {
      return true;
    }
  }
}
