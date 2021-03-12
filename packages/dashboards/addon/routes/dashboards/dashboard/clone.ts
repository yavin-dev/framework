/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import type UserService from 'navi-core/services/user';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type { ModelFrom } from 'navi-core/utils/type-utils';
import type DashboardModel from 'navi-core/models/dashboard';
import type DashboardWidget from 'navi-core/models/dashboard-widget';

export default class DashboardsDashboardCloneRoute extends Route {
  @service declare user: UserService;

  @service declare naviNotifications: NaviNotificationsService;

  /**
   * Sets the model for this route
   *
   * @override
   * @returns dashboard model
   */
  model() {
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    return this._cloneDashboard(dashboard);
  }

  /**
   * Transitions to dashboard
   *
   * @param dashboard - resolved dashboard model
   * @override
   */
  afterModel(dashboard: DashboardModel) {
    return this.replaceWith('dashboards.dashboard', dashboard.id);
  }

  /**
   * Clones the dashboard model object
   *
   * @private
   * @param dashboardModel - The dashboard Model that needs to be cloned
   * @returns dashboard promise
   */
  async _cloneDashboard(dashboardModel: DashboardModel) {
    const cloneDashboard = dashboardModel.clone();
    cloneDashboard.title = `Copy of ${cloneDashboard.title}`.substring(0, 150);
    await cloneDashboard.save();

    const clonedWidgets = await this._cloneWidgets(dashboardModel, cloneDashboard);

    const layout = cloneDashboard.presentation.layout;
    clonedWidgets.forEach((widget, idx) => {
      const layoutItem = layout.objectAt(idx);
      assert('Layout item exists', layoutItem);
      layoutItem.widgetId = Number(widget.id);
    });

    //Replace original widget IDs with newly cloned widget IDs
    return cloneDashboard.save();
  }

  /**
   * Clones the widgets for a dashboard
   *
   * @private
   * @param dashboardModel - The dashboard Model that needs to be cloned
   * @param cloneDashboardModel - The Cloned dashboard Model
   * @returns Array of widget promises ordered to match dashboard layout array
   */
  async _cloneWidgets(dashboardModel: DashboardModel, cloneDashboardModel: DashboardModel) {
    const widgets = await dashboardModel.widgets;
    const widgetsById = widgets.reduce((widgetsById: Record<string, DashboardWidget>, widget) => {
      widgetsById[widget.id] = widget;
      return widgetsById;
    }, {});

    const clonedWidgets = [];
    const layoutItems = cloneDashboardModel.presentation.layout.toArray();
    for (const item of layoutItems) {
      const cloneWidget = widgetsById[item.widgetId].clone();

      cloneWidget.set('dashboard', cloneDashboardModel);
      await cloneWidget.save();
      clonedWidgets.push(cloneWidget);
    }
    return clonedWidgets;
  }

  /**
   * action to handle errors in route
   */
  @action
  error() {
    this.naviNotifications.add({
      title: 'An error occurred while cloning the dashboard',
      style: 'danger',
      timeout: 'medium',
    });
    this.replaceWith('dashboards');
  }
}
