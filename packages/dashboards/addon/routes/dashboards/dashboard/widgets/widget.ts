/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import ReportsReportRoute from 'navi-reports/routes/reports/report';
import type DashboardWidget from 'navi-core/models/dashboard-widget';
import type DashboardsDashboardWidgetsRoute from 'navi-dashboards/routes/dashboards/dashboard/widgets';
import type { ModelFrom } from 'navi-core/utils/type-utils';

export default class DashboardsDashboardWidgetsWidgetRoute extends ReportsReportRoute {
  /**
   * @param params - persisted id or temp id of widget to fetch
   * @returns model for requested widget
   */
  // TODO: Overriding route model
  //@ts-ignore
  model({ widget_id }: { widget_id: string }): DashboardWidget | never {
    const widgets = this.modelFor('dashboards.dashboard.widgets') as ModelFrom<DashboardsDashboardWidgetsRoute>;
    const widgetModel = widgets.findBy('id', widget_id) || this._findTempWidget(widget_id);

    if (widgetModel) {
      return widgetModel;
    }

    throw new Error(`Widget ${widget_id} could not be found`);
  }

  /**
   * @private
   * @param id - temp id of local widget
   * @returns widget with matching temp id
   */
  _findTempWidget(id: string): DashboardWidget | undefined {
    return this.store.peekAll('dashboard-widget').findBy('tempId', id);
  }

  /**
   * @param widget - object to save
   */
  @action
  saveWidget(widget: DashboardWidget): void {
    const { tempId } = widget;

    // When saving a widget for the first time, we need to add it to the dashboard
    if (tempId) {
      this.transitionTo('dashboards.dashboard.widgets.add', {
        queryParams: {
          unsavedWidgetId: tempId,
        },
      });
    } else {
      widget
        .save()
        .then(() => {
          this.naviNotifications.add({
            title: 'Widget saved',
            style: 'success',
            timeout: 'short',
          });

          // Refresh the parent route to have the latest widget changes
          getOwner(this).lookup('route:dashboards/dashboard').refresh();
        })
        .catch(() => {
          this.naviNotifications.add({
            title: 'An error occurred while saving the widget',
            style: 'danger',
            timeout: 'medium',
          });
        });
    }
  }
}
