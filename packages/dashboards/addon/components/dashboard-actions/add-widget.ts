/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */

import Component from '@glimmer/component';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import DashboardModel from 'navi-core/models/dashboard';
import ReportModel from 'navi-core/models/report';
import DS from 'ember-data';

interface Args {
  dashboard: DashboardModel;
  reports: DS.PromiseArray<ReportModel>;
  addWidgetToDashboard: (dashboardId: number, reportName: string) => void;
}

interface HasId {
  id: string;
}

const newReport = {
  id: 'new',
  title: 'Create new...',
};
export default class AddWidgetComponent extends Component<Args> {
  @tracked
  showModal = false;

  @tracked
  selectedReport: HasId = newReport;

  /**
   * @property {Array} reportsWithCreate - users reports with create new as the first object
   */
  get reportsWithCreate() {
    return A([
      newReport,
      {
        groupName: 'My Reports',
        options: this.args.reports.toArray(),
      },
    ]);
  }

  @action
  toggleModal() {
    this.showModal = !this.showModal;
    //Reset default selection
    if (this.showModal) {
      this.selectedReport = newReport;
    }
  }
}
