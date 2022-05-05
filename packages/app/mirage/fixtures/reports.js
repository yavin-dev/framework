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
      version: 2,
      metadata: {
        style: {},
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metricCid: 'On39J_pg3X',
                dimensions: [
                  {
                    name: '0',
                    values: {
                      egGEHPAAvX: '0',
                    },
                  },
                  {
                    name: '1',
                    values: {
                      egGEHPAAvX: '1',
                    },
                  },
                  {
                    name: '2',
                    values: {
                      egGEHPAAvX: '2',
                    },
                  },
                  {
                    name: '3',
                    values: {
                      egGEHPAAvX: '3',
                    },
                  },
                  {
                    name: '4',
                    values: {
                      egGEHPAAvX: '4',
                    },
                  },
                  {
                    name: '5',
                    values: {
                      egGEHPAAvX: '5',
                    },
                  },
                  {
                    name: '6',
                    values: {
                      egGEHPAAvX: '6',
                    },
                  },
                  {
                    name: '7',
                    values: {
                      egGEHPAAvX: '7',
                    },
                  },
                  {
                    name: '8',
                    values: {
                      egGEHPAAvX: '8',
                    },
                  },
                  {
                    name: '9',
                    values: {
                      egGEHPAAvX: '9',
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    request: {
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
          cid: '98PEvO3nd5',
          alias: null,
          field: 'gameStats.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'egGEHPAAvX',
          alias: null,
          field: 'character',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          cid: 'On39J_pg3X',
          alias: null,
          field: 'wins',
          parameters: {},
          type: 'metric',
        },
        {
          cid: 'D-sQV-zDsp',
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
  },
  {
    id: 2,
    title: 'Top Played Games',
    createdOn: '1992-08-27 00:00:00',
    updatedOn: '2017-04-28 00:00:00',
    ownerId: 'navi_user',
    visualization: {
      type: 'line-chart',
      version: 2,
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
          cid: 'iUsAFmMxcy',
          alias: null,
          field: 'gameStats.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: '9UAFaJpzFT',
          alias: null,
          field: 'game',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          cid: 'EQT0kwW0et',
          alias: null,
          field: 'timeSpent',
          parameters: {},
          type: 'metric',
        },
      ],
      table: 'gameStats',
      sorts: [],
      rollup: {
        columnCids: [],
        grandTotal: false,
      },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'default',
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
      version: 2,
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
                    values: {
                      platform: 'switch',
                      game: 'galaxy_2',
                    },
                  },
                  {
                    name: 'nes,3d_land',
                    values: {
                      platform: 'nes',
                      game: '3d_land',
                    },
                  },
                  {
                    name: 'nes,sunshine',
                    values: {
                      platform: 'nes',
                      game: 'sunshine',
                    },
                  },
                  {
                    name: 'switch,kart',
                    values: {
                      platform: 'switch',
                      game: 'kart',
                    },
                  },
                  {
                    name: 'entertainment system,kart',
                    values: {
                      platform: 'nes',
                      game: 'kart',
                    },
                  },
                  {
                    name: 'entertainment system,oddysey',
                    values: {
                      platform: 'nes',
                      game: 'oddysey',
                    },
                  },
                  {
                    name: '64,oddysey',
                    values: {
                      platform: '64',
                      game: 'oddysey',
                    },
                  },
                  {
                    name: '64,3d land',
                    values: {
                      platform: '64',
                      game: '3d_land',
                    },
                  },
                  {
                    name: '64,galaxy',
                    values: {
                      platform: '64',
                      game: 'galaxy',
                    },
                  },
                  {
                    name: '64,sunshine',
                    values: {
                      platform: '64',
                      game: 'sunshine',
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['P30D', 'current'],
          field: 'gameStats.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'jQMq8mmKPY',
          alias: null,
          field: 'gameStats.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'KrAbGxmkfT',
          alias: null,
          field: 'platform',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          cid: 'R1NGaIiJxV',
          alias: null,
          field: 'game',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          cid: 'fqB8e0yHai',
          alias: null,
          field: 'coins',
          parameters: {},
          type: 'metric',
        },
      ],
      table: 'gameStats',
      sorts: [],
      rollup: {
        columnCids: [],
        grandTotal: false,
      },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'default',
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
