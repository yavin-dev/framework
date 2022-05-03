/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import type FilterFragment from 'navi-core/models/request/filter';
import type DashboardModel from 'navi-core/models/dashboard';

interface Args {
  dashboard: DashboardModel;
  deleteAction: (dashboard: DashboardModel) => void;
  addWidgetToDashboard: (dashboardId: number, reportName: string) => void;
  onUpdateFilter(filter: FilterFragment): void;
  onRemoveFilter(filter: FilterFragment): void;
  onAddFilter(filter: FilterFragment): void;
}

export default class DashboardHeaderComponent extends Component<Args> {
  get dataSources(): string[] {
    const { presentation, widgets } = this.args.dashboard;
    // only use widgets that are shown on the dashboard
    const shownWidgets = new Set(presentation.layout.toArray().map((layout) => `${layout.widgetId}`));
    const requests = widgets
      .filter((widget) => shownWidgets.has(widget.id))
      .flatMap((widget) => widget.requests.toArray());
    const dataSources = requests.map((request) => request.dataSource);
    return [...new Set(dataSources)];
  }
}
