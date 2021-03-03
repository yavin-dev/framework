/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import FilterFragment from 'navi-core/addon/models/bard-request-v2/fragments/filter';
import DashboardModel from 'navi-core/addon/models/dashboard';

interface Args {
  dashboard: DashboardModel;
  deleteAction: (dashboard: DashboardModel) => void;
  addWidgetToDashboard: (dashboardId: number, reportName: string) => void;
  onUpdateFilter(filter: FilterFragment): void;
  onRemoveFilter(filter: FilterFragment): void;
  onAddFilter(filter: FilterFragment): void;
}

export default class DashboardHeaderComponent extends Component<Args> {}
