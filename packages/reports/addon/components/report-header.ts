/**
 * Copyright 2021, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import ReportModel from 'navi-core/models/report';

interface ReportHeaderArgs {
  model: ReportModel;
  addToDashboard?: (reportId: string, reportName: string) => void;
  addToNewDashboard?: (dashboardTitle: string, reportName: string) => void;
}

export default class ReportHeader extends Component<ReportHeaderArgs> {
  get dataSources() {
    const { dataSource } = this.args.model.request;
    return dataSource ? [dataSource] : undefined;
  }
}
