/**
 * Copyright 2020, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 */
export default [
  {
    id: 1,
    title: 'Kart Wins By Character',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    authorId: 'navi_user',
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
    request: {
      logicalTable: {
        table: 'mario',
        timeGrain: 'day'
      },
      metrics: [{ metric: 'wins' }, { metric: 'timeSpent' }],
      dimensions: [{ dimension: 'character' }],
      filters: [],
      sort: [
        {
          metric: 'wins',
          direction: 'asc'
        }
      ],
      intervals: [
        {
          end: 'current',
          start: 'P7D'
        }
      ],
      bardVersion: 'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 2,
    title: 'Top Played Games',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    authorId: 'navi_user',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metric: 'timeSpent',
                dimensionOrder: ['game'],
                dimensions: [
                  {
                    name: 'Galaxy 2',
                    values: { game: 'galaxy_2' }
                  },
                  {
                    name: 'Sunshine',
                    values: { game: 'sunshine' }
                  },
                  {
                    name: '3D Land',
                    values: { game: '3d_land' }
                  },
                  {
                    name: 'Galaxy',
                    values: { game: 'galaxy' }
                  },
                  {
                    name: 'Oddysey',
                    values: { game: 'oddysey' }
                  },
                  {
                    name: 'Kart',
                    values: { game: 'kart' }
                  }
                ]
              }
            }
          }
        }
      }
    },
    request: {
      logicalTable: {
        table: 'mario',
        timeGrain: 'day'
      },
      metrics: [{ metric: 'timeSpent' }],
      dimensions: [{ dimension: 'game' }],
      filters: [],
      intervals: [
        {
          end: 'current',
          start: 'P7D'
        }
      ],
      bardVersion: 'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 4,
    title: 'Coin Counts',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    authorId: 'navi_user',
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metric: 'coins',
                dimensionOrder: ['platform', 'game'],
                dimensions: [
                  {
                    name: 'Switch,Galaxy 2',
                    values: { platform: 'switch', game: 'galaxy_2' }
                  },
                  {
                    name: 'Entertainment System,3D Land',
                    values: { platform: 'nes', game: '3d_land' }
                  },
                  {
                    name: 'Entertainment System,Sunshine',
                    values: { platform: 'nes', game: 'sunshine' }
                  },
                  {
                    name: 'Switch,Kart',
                    values: { platform: 'switch', game: 'kart' }
                  },
                  {
                    name: 'Entertainment System,Kart',
                    values: { platform: 'nes', game: 'kart' }
                  },
                  {
                    name: 'Entertainment System,Oddysey',
                    values: { platform: 'nes', game: 'oddysey' }
                  },
                  {
                    name: '64,Oddysey',
                    values: { platform: '64', game: 'oddysey' }
                  },
                  {
                    name: '64,3D Land',
                    values: { platform: '64', game: '3d_land' }
                  },
                  {
                    name: '64,Galaxy',
                    values: { platform: '64', game: 'galaxy' }
                  },
                  {
                    name: '64,Sunshine',
                    values: { platform: '64', game: 'sunshine' }
                  }
                ]
              }
            }
          }
        }
      }
    },
    request: {
      logicalTable: {
        table: 'mario',
        timeGrain: 'day'
      },
      metrics: [{ metric: 'coins' }],
      dimensions: [{ dimension: 'platform' }, { dimension: 'game' }],
      filters: [],
      intervals: [
        {
          end: 'current',
          start: 'P30D'
        }
      ],
      bardVersion: 'v1',
      requestVersion: 'v1'
    }
  }
];
