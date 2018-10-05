export default [
  {
    id: 1,
    title: 'Kart Wins By Character',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    authorId: 'navi_user',
    dashboardId: 1,
    visualization: {
      type: 'line-chart',
      version: 1,

      metadata: {
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metric: 'wins',
                dimensionOrder: ['character'],
                dimensions: [
                  {
                    name: 'Dry Bowser',
                    values: { character: '7' }
                  },
                  {
                    name: 'Daisy',
                    values: { character: '4' }
                  },
                  {
                    name: 'Wario',
                    values: { character: '8' }
                  }
                ]
              }
            }
          }
        }
      }
    },
    requests: [
      {
        logicalTable: {
          table: 'mario',
          timeGrain: 'day'
        },
        metrics: [{ metric: 'wins' }, { metric: 'timeSpent' }],
        dimensions: [{ dimension: 'character' }],
        filters: [],
        sort: [{ metric: 'wins', direction: 'asc' }],
        intervals: [{ end: 'current', start: 'P7D' }],
        bardVersion: 'v1',
        requestVersion: 'v1'
      }
    ]
  }
];
