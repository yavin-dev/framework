export default [
  {
    id: 1,
    dashboardId: 1,
    ownerId: 'navi_user',
    title: 'Mobile DAU Goal',
    visualization: {
      type: 'goal-gauge',
      version: 2,
      metadata: {
        metricCid: 'PCdZCDbqC0',
        baselineValue: 406.269,
        goalValue: 496.55100000000004,
      },
    },
    requests: [
      {
        filters: [
          {
            operator: 'bet',
            values: ['P1D', 'current'],
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
        ],
        columns: [
          {
            cid: 'tenTF49KXL',
            alias: null,
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            cid: 'PCdZCDbqC0',
            alias: null,
            field: 'adClicks',
            parameters: {},
            type: 'metric',
          },
        ],
        table: 'network',
        sorts: [],
        rollup: {
          columnCids: [],
          grandTotal: false,
        },
        limit: null,
        requestVersion: '2.0',
        dataSource: 'bardOne',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 2,
    dashboardId: 1,
    ownerId: 'navi_user',
    title: 'Mobile DAU Graph',
    visualization: {
      type: 'line-chart',
      version: 2,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['adClicks', 'navClicks'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        filters: [
          {
            operator: 'bet',
            values: ['P7D', 'current'],
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
        ],
        columns: [
          {
            cid: 'VObA4Zq2MK',
            alias: null,
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            cid: '8yzE0cScgg',
            alias: null,
            field: 'adClicks',
            parameters: {},
            type: 'metric',
          },
          {
            cid: '5R7J9Q4uOx',
            alias: null,
            field: 'navClicks',
            parameters: {},
            type: 'metric',
          },
        ],
        table: 'network',
        sorts: [],
        rollup: {
          columnCids: [],
          grandTotal: false,
        },
        limit: null,
        requestVersion: '2.0',
        dataSource: 'bardOne',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 3,
    dashboardId: 1,
    ownerId: 'navi_user',
    title: 'Mobile DAU Table',
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {},
      },
    },
    requests: [
      {
        filters: [
          {
            operator: 'bet',
            values: ['P7D', 'current'],
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
        ],
        columns: [
          {
            cid: 'cvAprxQe4C',
            alias: null,
            field: 'network.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            cid: 'CASr_2AI9v',
            alias: null,
            field: 'os',
            parameters: {
              field: 'id',
            },
            type: 'dimension',
          },
          {
            cid: 'l5hgUmpVep',
            alias: null,
            field: 'uniqueIdentifier',
            parameters: {},
            type: 'metric',
          },
          {
            cid: 'THFwDEHpdg',
            alias: null,
            field: 'totalPageViews',
            parameters: {},
            type: 'metric',
          },
        ],
        table: 'network',
        sorts: [],
        rollup: {
          columnCids: [],
          grandTotal: false,
        },
        limit: null,
        requestVersion: '2.0',
        dataSource: 'bardOne',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 4,
    dashboardId: 2,
    ownerId: 'navi_user',
    title: 'Clicks',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['adClicks', 'navClicks'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 5,
    dashboardId: 2,
    ownerId: 'navi_user',
    title: 'Last Week By OS',
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: [],
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'uniqueIdentifier' }, { metric: 'totalPageViews' }],
        dimensions: [{ dimension: 'os' }],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 6,
    dashboardId: 4,
    ownerId: 'ciela',
    title: 'Clicks',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['adClicks', 'navClicks'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 7,
    dashboardId: 6,
    ownerId: 'ciela',
    title: 'Sale Contribution Value',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['personalSold', 'globallySold'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'inventory',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'personalSold' }, { metric: 'globallySold' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
        dataSource: 'bardTwo',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 8,
    dashboardId: 6,
    ownerId: 'navi_user',
    title: 'Mobile DAU Goal',
    visualization: {
      type: 'goal-gauge',
      version: 1,
      metadata: {
        baselineValue: 200,
        goalValue: 1000,
        metric: { metric: 'adClicks', parameters: {} },
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P1D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 9,
    dashboardId: 6,
    ownerId: 'navi_user',
    title: 'Mobile DAU Graph',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['adClicks', 'navClicks'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'adClicks' }, { metric: 'navClicks' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
        dataSource: 'bardOne',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    id: 10,
    dashboardId: 7,
    ownerId: 'navi_user',
    title: 'Datasource error',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: ['adClicks'],
              },
            },
          },
        },
      },
    },
    requests: [
      {
        columns: [
          {
            alias: null,
            field: 'network.dateTime',
            cid: 'cid3',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            alias: null,
            field: 'adClicks',
            cid: 'cid2',
            parameters: {},
            type: 'metric',
          },
          {
            alias: null,
            field: 'navClicks',
            cid: 'cid1',
            parameters: {},
            type: 'metric',
          },
        ],
        dataSource: 'foo',
        filters: [
          {
            field: 'network.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
            values: ['P1D', 'current'],
          },
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'network',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
  {
    title: 'Mobile DAU Goal',
    dashboardId: 7,
    id: 11,
    ownerId: 'navi_user',
    visualization: {
      type: 'goal-gauge',
      version: 2,
      metadata: {
        baselineValue: 200,
        goalValue: 1000,
        metricCid: 'm1',
      },
    },
    requests: [
      {
        columns: [
          {
            alias: null,
            field: 'network.dateTime',
            cid: 'm3',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            alias: null,
            field: 'adClicks',
            cid: 'm2',
            parameters: {},
            type: 'metric',
          },
          {
            alias: null,
            field: 'navClicks',
            cid: 'm1',
            parameters: {},
            type: 'metric',
          },
        ],
        dataSource: 'bardOne',
        filters: [
          {
            field: 'network.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
            values: ['P1D', 'current'],
          },
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'network',
      },
    ],
    createdOn: '2016-01-01 00:00:00.000',
    updatedOn: '2016-01-01 00:00:00.000',
  },
  {
    title: 'Mobile DAU Goal',
    dashboardId: 3,
    id: 12,
    ownerId: 'ciela',
    visualization: {
      type: 'goal-gauge',
      version: 2,
      metadata: {
        baselineValue: 200,
        goalValue: 1000,
        metricCid: 'm1',
      },
    },
    requests: [
      {
        columns: [
          {
            alias: null,
            field: 'network.dateTime',
            cid: 'm3',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            alias: null,
            field: 'adClicks',
            cid: 'm2',
            parameters: {},
            type: 'metric',
          },
          {
            alias: null,
            field: 'navClicks',
            cid: 'm1',
            parameters: {},
            type: 'metric',
          },
        ],
        dataSource: 'bardOne',
        filters: [
          {
            field: 'network.dateTime',
            operator: 'bet',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
            values: ['P1D', 'current'],
          },
        ],
        limit: null,
        requestVersion: '2.0',
        sorts: [],
        table: 'network',
      },
    ],
    createdOn: '2016-01-01 00:00:00.000',
    updatedOn: '2016-01-01 00:00:00.000',
  },
  {
    id: 13,
    dashboardId: 8,
    ownerId: 'navi_user',
    title: 'Last Week By OS',
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columns: [
          {
            alias: null,
            field: 'dateTime',
            type: 'dateTime',
            displayName: 'Date',
          },
          {
            alias: null,
            field: 'os',
            type: 'dimension',
            displayName: 'OS',
          },
          {
            alias: null,
            field: 'uniqueIdentifier',
            type: 'metric',
            displayName: 'Unique Identifier',
          },
          {
            alias: null,
            field: 'totalPageViews',
            type: 'metric',
            displayName: 'Total Page Views',
          },
        ],
      },
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day',
        },
        metrics: [{ metric: 'uniqueIdentifier' }, { metric: 'totalPageViews' }],
        dimensions: [{ dimension: 'os' }],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D',
          },
        ],
        bardVersion: 'v1',
        requestVersion: 'v1',
      },
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00',
  },
];
