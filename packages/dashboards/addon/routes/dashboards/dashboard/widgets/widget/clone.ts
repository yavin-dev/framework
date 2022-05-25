/**
 * Copyright 2022, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type { ModelFrom, Transition } from 'navi-core/utils/type-utils';
import type NaviNotificationsService from 'navi-core/services/interfaces/navi-notifications';
import type DashboardsDashboardRoute from 'navi-dashboards/routes/dashboards/dashboard';
import type DashboardsDashboardWidgetsWidgetRoute from 'navi-dashboards/routes/dashboards/dashboard/widgets/widget';
import type DashboardWidget from 'navi-core/models/dashboard-widget';

export default class DashboardsDashboardWidgetsWidgetCloneRoute extends Route {
  @service declare naviNotifications: NaviNotificationsService;

  beforeModel() {
    const dashboard = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    if (!dashboard.canUserEdit) {
      this.naviNotifications.add({
        title: 'You do not have edit permission for this dashboard.',
        style: 'danger',
        timeout: 'medium',
      });
      this.transitionTo('dashboards.dashboard', dashboard.id);
    }
  }

  model() {
    const widget = this.modelFor(
      'dashboards.dashboard.widgets.widget'
    ) as ModelFrom<DashboardsDashboardWidgetsWidgetRoute>;
    const clone = widget.clone();
    clone.title = `Copy of ${widget.title}`.substring(0, 150);
    return clone;
  }

  afterModel(widget: DashboardWidget): Transition {
    const { id: dashboardId } = this.modelFor('dashboards.dashboard') as ModelFrom<DashboardsDashboardRoute>;
    return this.transitionTo('dashboards.dashboard.widgets.add', dashboardId, {
      queryParams: {
        unsavedWidgetId: widget.tempId,
      },
    });
  }
}
