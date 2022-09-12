import type { Request } from '@yavin/client/request';
import type { Dashboard, DashboardWidget, Report, DeliveryRule, JSONAPI } from '../lib/index';

const request: Request = {
  columns: [],
  dataSource: 'dataSource',
  filters: [],
  requestVersion: '2.0',
  sorts: [],
  table: 'table',
  limit: 23,
  rollup: {
    columnCids: [],
    grandTotal: true,
  },
};

const owner = <const>{
  data: {
    type: 'users',
    id: 'yavin',
  },
};

const visualization = {
  type: 'cool-table',
  version: 1,
  namespace: 'yavin',
  metadata: {},
};

const deliveryRules: JSONAPI<DeliveryRule> = {
  data: {
    id: '2',
    type: 'deliveryRules',
    attributes: {
      createdOn: '123',
      dataSources: ['dataSource'],
      delivery: 'email',
      deliveryType: 'report',
      failureCount: 0,
      format: {
        type: 'gsheet',
        options: { overwriteFile: false },
      },
      frequency: 'day',
      isDisabled: false,
      lastDeliveredOn: '456',
      name: null,
      recipients: ['recipient@mail.domain'],
      schedulingRules: {
        mustHaveData: false,
      },
      updatedOn: '789',
      version: '1',
    },
    relationships: {
      deliveredItem: { data: { type: 'reports', id: '2' } },
      owner,
    },
  },
};

const report: JSONAPI<Report> = {
  data: {
    id: '2',
    type: 'reports',
    attributes: {
      createdOn: '234',
      updatedOn: '567',
      request,
      title: 'My Report',
      visualization,
    },
    relationships: {
      deliveryRules: { data: [{ type: 'deliveryRules', id: '2' }] },
      owner,
    },
  },
};

const widget: JSONAPI<DashboardWidget> = {
  data: {
    id: '3',
    type: 'dashboardWidgets',
    attributes: {
      createdOn: '234',
      updatedOn: '567',
      requests: [request],
      title: 'My Widget',
      visualization,
    },
    relationships: {
      dashboard: {
        data: {
          type: 'dashboards',
          id: '5',
        },
      },
      owner,
    },
  },
};

const dashboard: JSONAPI<Dashboard> = {
  data: {
    id: '7',
    type: 'dashboards',
    attributes: {
      createdOn: '234',
      updatedOn: '567',
      title: 'My Widget',
      filters: [
        { dimension: 'age', field: 'id', operator: 'in', values: ['4'], type: 'dimension' },
        { dimension: 'age', field: 'id', operator: 'in', values: ['4'] },
      ],
      presentation: {
        version: 1,
        columns: 12,
        layout: [{ column: 0, row: 0, height: 1, width: 1, widgetId: 3 }],
      },
    },
    relationships: {
      deliveryRules: { data: [] },
      editors: { data: [] },
      widgets: { data: [{ type: 'dashboardWidgets', id: '3' }] },
      owner,
    },
  },
};

const mockResponse: JSONAPI<Dashboard, DashboardWidget> = {
  data: dashboard.data,
  included: [widget.data],
};
