export default [
  {
    id: 1,
    dashboardId: 1,
    authorId: 'navi_user',
    title: 'Mobile DAU Goal',
    visualization: {
      type: 'goal-gauge',
      version: 1,
      metadata: {
        baselineValue: 200,
        goalValue: 1000,
        metric: {metric: 'adClicks', parameters: {}}
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'adClicks' },
          { metric: 'navClicks' }
        ],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P1D'
          }
        ],
        bardVersion:    'v1',
        requestVersion: 'v1'
      }
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00'
  },
  {
    id: 2,
    dashboardId: 1,
    authorId: 'navi_user',
    title: 'Mobile DAU Graph',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            "series": {
              "type": "metric",
              "config": {
                "metrics": [ "adClicks", "navClicks" ]
              }
            }
          }
        }
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'adClicks' },
          { metric: 'navClicks' }
        ],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D'
          }
        ],
        bardVersion:    'v1',
        requestVersion: 'v1'
      }
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00'
  },
  {
    id: 3,
    dashboardId: 1,
    authorId: 'navi_user',
    title: 'Mobile DAU Table',
    visualization: {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            field: 'dateTime',
            type: 'dateTime',
            displayName: 'Date'
          },
          {
            field: 'os',
            type: 'dimension',
            displayName: 'OS'
          },
          {
            field: 'uniqueIdentifier',
            type: 'metric',
            displayName: 'Unique Identifier'
          },
          {
            field: 'totalPageViews',
            type: 'metric',
            displayName: 'Total Page Views'
          }
        ]
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'uniqueIdentifier' },
          { metric: 'totalPageViews' }
        ],
        dimensions: [
          {dimension: 'os'}
        ],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D'
          }
        ],
        bardVersion:    'v1',
        requestVersion: 'v1'
      }
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00'
  },
  {
    id: 4,
    dashboardId: 2,
    authorId: 'navi_user',
    title: 'Clicks',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            "series": {
              "type": "metric",
              "config": {
                "metrics": [ "adClicks", "navClicks" ]
              }
            }
          }
        }
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'adClicks' },
          { metric: 'navClicks' }
        ],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D'
          }
        ],
        bardVersion:    'v1',
        requestVersion: 'v1'
      }
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00'
  },
  {
    id: 5,
    dashboardId: 2,
    authorId: 'navi_user',
    title: 'Last Week By OS',
    visualization: {
      type: 'table',
      version: 1,
      metadata: {
        columns: [
          {
            field: 'dateTime',
            type: 'dateTime',
            displayName: 'Date'
          },
          {
            field: 'os',
            type: 'dimension',
            displayName: 'OS'
          },
          {
            field: 'uniqueIdentifier',
            type: 'metric',
            displayName: 'Unique Identifier'
          },
          {
            field: 'totalPageViews',
            type: 'metric',
            displayName: 'Total Page Views'
          }
        ]
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [
          { metric: 'uniqueIdentifier' },
          { metric: 'totalPageViews' }
        ],
        dimensions: [
          {dimension: 'os'}
        ],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D'
          }
        ],
        bardVersion:    'v1',
        requestVersion: 'v1'
      }
    ],
    createdOn: '2016-01-01 00:00:00',
    updatedOn: '2016-01-01 00:00:00'
  }
];
