export default [
  {
    id: 1,
    title: 'Kart Wins By Character',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    ownerId: 'navi_user',
    dashboardId: 1,
    visualization: {
      type: 'line-chart',
      version: 2,
      metadata: {
        style: {},
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metricCid: 'HcML68Uc50',
                dimensions: [
                  {
                    name: '0',
                    values: {
                      YH_WpZHyvB: '0',
                    },
                  },
                  {
                    name: '1',
                    values: {
                      YH_WpZHyvB: '1',
                    },
                  },
                  {
                    name: '2',
                    values: {
                      YH_WpZHyvB: '2',
                    },
                  },
                  {
                    name: '3',
                    values: {
                      YH_WpZHyvB: '3',
                    },
                  },
                  {
                    name: '4',
                    values: {
                      YH_WpZHyvB: '4',
                    },
                  },
                  {
                    name: '5',
                    values: {
                      YH_WpZHyvB: '5',
                    },
                  },
                  {
                    name: '6',
                    values: {
                      YH_WpZHyvB: '6',
                    },
                  },
                  {
                    name: '7',
                    values: {
                      YH_WpZHyvB: '7',
                    },
                  },
                  {
                    name: '8',
                    values: {
                      YH_WpZHyvB: '8',
                    },
                  },
                  {
                    name: '9',
                    values: {
                      YH_WpZHyvB: '9',
                    },
                  },
                ],
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
            field: 'gameStats.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
        ],
        columns: [
          {
            cid: 'rJ4YqurRXU',
            alias: null,
            field: 'gameStats.dateTime',
            parameters: {
              grain: 'day',
            },
            type: 'timeDimension',
          },
          {
            cid: 'YH_WpZHyvB',
            alias: null,
            field: 'character',
            parameters: {
              field: 'id',
            },
            type: 'dimension',
          },
          {
            cid: 'HcML68Uc50',
            alias: null,
            field: 'wins',
            parameters: {},
            type: 'metric',
          },
          {
            cid: 'jUfeHpovLU',
            alias: null,
            field: 'timeSpent',
            parameters: {},
            type: 'metric',
          },
        ],
        table: 'gameStats',
        sorts: [
          {
            direction: 'asc',
            field: 'wins',
            parameters: {},
            type: 'metric',
          },
        ],
        rollup: {
          columnCids: [],
          grandTotal: false,
        },
        limit: null,
        requestVersion: '2.0',
        dataSource: 'default',
      },
    ],
  },
];
