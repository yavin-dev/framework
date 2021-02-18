import Component from '@glimmer/component';
import DashboardModel from 'navi-core/addon/models/dashboard';

interface Args {
  dashboard: DashboardModel;
  deleteAction: (dashboard: DashboardModel) => void;
  addWidgetToDashboard: (dashboardId: number, reportName: string) => void;
}

export default class DashboardHeaderComponent extends Component<Args> {}
