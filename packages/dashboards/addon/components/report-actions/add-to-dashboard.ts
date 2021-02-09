import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import DashboardModel from 'navi-core/models/dashboard';
import UserService from 'navi-core/services/user';
import ReportModel from 'navi-core/models/report';
import DS from 'ember-data';

interface Args {
  report: ReportModel;
  dashboards: DS.PromiseArray<DashboardModel>;
  onAddToDashboard: (reportId: number, reportName: string) => void;
  onAddToNewDashboard: (dashboardTitle: string, reportName: string) => void;
}
export default class AddToDashboardComponent extends Component<Args> {
  @tracked
  showModal = false;

  @tracked
  shouldCreateDashboard = false;

  @tracked
  selectedDashboard!: DashboardModel;

  @tracked
  newDashboardTitle!: string;

  @tracked
  customReportName!: string;

  @service
  user!: UserService;

  get groupedDashboards() {
    return A([
      {
        groupName: 'My Dashboards',
        options: this.args.dashboards.toArray()
      }
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
    if (this.shouldCreateDashboard) {
      this.args.onAddToNewDashboard(this.newDashboardTitle, this.reportName);
    } else {
      this.args.onAddToDashboard(this.selectedDashboard.id, this.reportName);
    }
  }
}
