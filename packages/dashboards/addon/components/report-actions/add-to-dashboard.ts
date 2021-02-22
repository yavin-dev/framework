import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';
import DashboardModel from 'navi-core/models/dashboard';
import UserService from 'navi-core/services/user';
import ReportModel from 'navi-core/models/report';
import DS from 'ember-data';

interface Args {
  report: ReportModel;
  dashboards: DS.PromiseArray<DashboardModel>;
  onAddToDashboard: (reportId: string, reportName: string) => void;
  onAddToNewDashboard: (dashboardTitle: string, reportName: string) => void;
}
export default class AddToDashboardComponent extends Component<Args> {
  @tracked
  showModal = false;

  @tracked
  shouldCreateDashboard = false;

  @tracked
  selectedDashboard?: DashboardModel;

  @tracked
  newDashboardTitle?: string;

  @tracked
  customReportName?: string;

  @service
  user!: UserService;

  get groupedDashboards() {
    return A([
      {
        groupName: 'My Dashboards',
        options: this.args.dashboards.toArray(),
      },
    ]);
  }

  get reportName() {
    return this.customReportName || this.args.report.title;
  }

  get disableAdd() {
    return !this.selectedDashboard && !this.newDashboardTitle?.trim();
  }

  @action
  addToDashboard() {
    const { newDashboardTitle, selectedDashboard } = this;
    if (this.shouldCreateDashboard) {
      assert('`newDashboardTitle` should be set', newDashboardTitle);
      this.args.onAddToNewDashboard(newDashboardTitle, this.reportName);
    } else {
      assert('`selectedDashboard` should be set', selectedDashboard);
      this.args.onAddToDashboard(selectedDashboard.id, this.reportName);
    }
  }
}
