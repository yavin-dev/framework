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
    ownerId: 'navi_user',
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
                    values: { character: '7' },
                  },
                  {
                    name: 'Daisy',
                    values: { character: '4' },
                  },
                  {
                    name: 'Wario',
                    values: { character: '8' },
                  },
                ],
              },
            },
          },
        },
      },
    },
    request: {
      logicalTable: {
        table: 'gameStats',
        timeGrain: 'day',
      },
      metrics: [{ metric: 'wins' }, { metric: 'timeSpent' }],
      dimensions: [{ dimension: 'character' }],
      filters: [],
      sort: [
        {
          metric: 'wins',
          direction: 'asc',
        },
      ],
      intervals: [
        {
          end: 'current',
          start: 'P7D',
        },
      ],
      bardVersion: 'v1',
      requestVersion: 'v1',
    },
  },
  {
    id: 2,
    title: 'Top Played Games',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    ownerId: 'navi_user',
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
                    values: { game: 'galaxy_2' },
                  },
                  {
                    name: 'Sunshine',
                    values: { game: 'sunshine' },
                  },
                  {
                    name: '3D Land',
                    values: { game: '3d_land' },
                  },
                  {
                    name: 'Galaxy',
                    values: { game: 'galaxy' },
                  },
                  {
                    name: 'Oddysey',
                    values: { game: 'oddysey' },
                  },
                  {
                    name: 'Kart',
                    values: { game: 'kart' },
                  },
                ],
              },
            },
          },
        },
      },
    },
    request: {
      logicalTable: {
        table: 'gameStats',
        timeGrain: 'day',
      },
      metrics: [{ metric: 'timeSpent' }],
      dimensions: [{ dimension: 'game' }],
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
  },
  {
    id: 4,
    title: 'Coin Counts',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    ownerId: 'navi_user',
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
                    name: 'switch,galaxy_2',
                    values: { platform: 'switch', game: 'galaxy_2' },
                  },
                  {
                    name: 'nes,3d_land',
                    values: { platform: 'nes', game: '3d_land' },
                  },
                  {
                    name: 'nes,sunshine',
                    values: { platform: 'nes', game: 'sunshine' },
                  },
                  {
                    name: 'switch,kart',
                    values: { platform: 'switch', game: 'kart' },
                  },
                  {
                    name: 'entertainment system,kart',
                    values: { platform: 'nes', game: 'kart' },
                  },
                  {
                    name: 'entertainment system,oddysey',
                    values: { platform: 'nes', game: 'oddysey' },
                  },
                  {
                    name: '64,oddysey',
                    values: { platform: '64', game: 'oddysey' },
                  },
                  {
                    name: '64,3d land',
                    values: { platform: '64', game: '3d_land' },
                  },
                  {
                    name: '64,galaxy',
                    values: { platform: '64', game: 'galaxy' },
                  },
                  {
                    name: '64,sunshine',
                    values: { platform: '64', game: 'sunshine' },
                  },
                ],
              },
            },
          },
        },
      },
    },
    request: {
      logicalTable: {
        table: 'gameStats',
        timeGrain: 'day',
      },
      metrics: [{ metric: 'coins' }],
      dimensions: [{ dimension: 'platform' }, { dimension: 'game' }],
      filters: [],
      intervals: [
        {
          end: 'current',
          start: 'P30D',
        },
      ],
      bardVersion: 'v1',
      requestVersion: 'v1',
    },
  },
  {
    id: 6,
    title: 'New Perspective Visualization',
    createdOn: '2022-02-14 00:00:00',
    updatedOn: '2022-02-14 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'perspective',
      namespace: 'perspective',
      version: 1,
      metadata: {},
    },
    request: {
      table: 'gameStats',
      dataSource: 'default',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          field: 'gameStats.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['2022-02-01T00:00:00.000Z', '2022-02-14T00:00:00.000Z'],
        },
      ],
      columns: [
        {
          cid: 'c1',
          field: 'gameStats.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'c2',
          type: 'metric',
          field: 'coins',
          parameters: {},
        },
        {
          cid: 'c3',
          type: 'dimension',
          field: 'platform',
          parameters: { field: 'id' },
        },
      ],
      sorts: [],
    },
  },
];
