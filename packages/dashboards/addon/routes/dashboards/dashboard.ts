/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action, setProperties } from '@ember/object';
import { A as arr } from '@ember/array';
import { isEmpty } from '@ember/utils';
import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import type UserService from 'navi-core/services/user';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type { ModelFrom, Transition } from 'navi-core/utils/type-utils';
import type DashboardModel from 'navi-core/models/dashboard';
import type DashboardsDashboardController from 'navi-dashboards/controllers/dashboards/dashboard';
import type DashboardWidget from 'navi-core/models/dashboard-widget';

// Trimmed down types https://github.com/gridstack/gridstack.js/blob/bcd609370e0c816d63ceaac69ab6bf38c3154074/src/types.ts#L188
interface GridStackWidget {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number | string;
}

export default class DashboardsDashboardRoute extends Route {
  @service declare user: UserService;
  @service declare naviNotifications: NaviNotificationsService;

  /**
   * current dashboard model
   */
  get currentDashboard(): DashboardModel {
    return this.modelFor(this.routeName) as ModelFrom<this>;
  }

  /**
   * Makes an ajax request to retrieve relevant widgets in the dashboard
   *
   * @override
   * @returns Promise that resolves to a dashboard model
   *
   */
  model({ dashboard_id }: { dashboard_id: string }) {
    return this.store.findRecord('dashboard', dashboard_id);
  }

  /**
   * Updates the dashboard layout property given a list of dashboard items
   * that have changed
   *
   * @param updatedWidgets - list of widgets
   * @private
   */
  _updateLayout(updatedWidgets: GridStackWidget[]): void {
    const { currentDashboard } = this;
    const layout = currentDashboard?.presentation?.layout;

    arr(updatedWidgets).forEach((updatedWidget) => {
      let modelWidget = layout.find((widget) => widget.widgetId === Number(updatedWidget.id));

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
   * @param title - The notification error message to be displayed
   */
  showErrorNotification(title: string): void {
    this.naviNotifications.add({
      title,
      style: 'danger',
      timeout: 'medium',
    });
  }

  /**
   * @override
   * @method deactivate - reset query params on exit of route
   */
  deactivate() {
    //@ts-ignore
    super.deactivate(...arguments);
    const dashboard = this.modelFor(this.routeName) as ModelFrom<this>;
    // don't rollback attributes if dashboard was unloaded.
    if (dashboard.get('isEmpty') !== true) {
      dashboard.rollbackAttributes();
    }
  }

  /**
   * If traveling to the same route as the current dashboard, cache the query for breadcrumb purposes
   * @param transition
   */
  cacheQuery(transition: Transition) {
    const controller = this.controllerFor(this.routeName) as DashboardsDashboardController;
    if (transition.from && transition.from.queryParams) {
      const fromRoute = transition.from.find((info) => info.paramNames.includes('dashboard_id'));
      const fromDashboardId = fromRoute ? fromRoute.params.dashboard_id : null;
      const toRoute = transition.to && transition.to.find((info) => info.paramNames.includes('dashboard_id'));
      const toDashboardId = toRoute ? toRoute.params.dashboard_id : null;

      if (fromDashboardId === toDashboardId) {
        controller.set('queryCache', transition.from.queryParams);
        return;
      }
    }
    controller.set('queryCache', null);
  }

  /**
   * updates dashboard's layout property and save it
   * @param event - event object
   * @param widgets - Array of widgets that updated
   */
  @action
  didUpdateLayout(_event: Event, widgets: GridStackWidget[]) {
    this._updateLayout(widgets);
  }

  /**
   * saves dashboard updates
   */
  @action
  async saveDashboard() {
    const { currentDashboard } = this;
    const widgets = currentDashboard?.widgets;

    try {
      await currentDashboard.save();
      await all(
        widgets.map(async (widget) => {
          if (widget.get('hasDirtyAttributes')) {
            await widget.save();
          }
          return widget;
        })
      );
    } catch (e) {
      this.naviNotifications.add({
        title: 'An error occurred while trying to save your dashboard.',
        style: 'danger',
        timeout: 'medium',
      });
    }
  }

  /**
   * @param widgetModel - object to delete
   */
  @action
  deleteWidget(widgetModel: DashboardWidget) {
    const { id } = widgetModel;

    widgetModel.deleteRecord();

    // Remove layout reference
    const presentation = this.currentDashboard?.presentation;
    const newLayout = arr(presentation.layout).rejectBy('widgetId', Number(id));

    // Ignore setting Fragment array
    //@ts-ignore
    presentation.layout = newLayout;

    return this.transitionTo('dashboards.dashboard', this.currentDashboard.id);
  }

  /**
   * toggles favorite dashboard
   */
  @action
  toggleFavorite(dashboard: DashboardModel) {
    const user = this.user.getUser();
    assert('User is found', user);
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
   * Updates dashboard model's title, unless new title is empty
   * @param title
   */
  @action
  updateTitle(title: string) {
    if (!isEmpty(title)) {
      const { currentDashboard } = this;
      currentDashboard.title = title;
    }
  }

  /**
   * Revert the dashboard.
   */
  @action
  revertDashboard() {
    const { currentDashboard } = this;
    currentDashboard.widgets.forEach((widget) => widget.rollbackAttributes());
    currentDashboard.rollbackAttributes();
  }

  /**
   * Prompts user if they are leaving the route with unsaved changes.
   * @param transition
   */
  @action
  willTransition(transition: Transition) {
    //subroute cache queryString and continue
    if (transition.to.name.startsWith(this.routeName)) {
      this.cacheQuery(transition);
      return true;
    }

    const { currentDashboard } = this;

    const isDirty =
      currentDashboard.get('hasDirtyAttributes') ||
      //@ts-ignore
      currentDashboard.get('filters.hasDirtyAttributes') ||
      //@ts-ignore
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

    return undefined;
  }
}
