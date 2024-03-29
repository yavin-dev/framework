/**
 * Copyright 2019, Yahoo Holdings Inc.
 * Licensed under the terms of the MIT license. See accompanying LICENSE.md file for terms.
 *
 * Reports Mock Data
 */
export default [
  {
    id: 1,
    title: 'Hyrule News',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
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
                metricCid: 'YLqKAtqCkg',
                dimensions: [
                  {
                    name: '114',
                    values: {
                      FG6KKIQKF_: '114',
                    },
                  },
                  {
                    name: '100001',
                    values: {
                      FG6KKIQKF_: '100001',
                    },
                  },
                  {
                    name: '100002',
                    values: {
                      FG6KKIQKF_: '100002',
                    },
                  },
                  {
                    name: '101272',
                    values: {
                      FG6KKIQKF_: '101272',
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
          values: ['2015-11-09T00:00:00.000Z', '2015-11-15T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'KpOdNIgM52',
          alias: null,
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'FG6KKIQKF_',
          alias: null,
          field: 'property',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          cid: 'YLqKAtqCkg',
          alias: null,
          field: 'adClicks',
          parameters: {},
          type: 'metric',
        },
        {
          cid: 'oE4nrlZwR-',
          alias: null,
          field: 'navClicks',
          parameters: {},
          type: 'metric',
        },
      ],
      table: 'network',
      sorts: [
        {
          direction: 'asc',
          field: 'navClicks',
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
      dataSource: 'bardOne',
    },
  },
  {
    id: 2,
    title: 'Hyrule Ad&Nav Clicks',
    createdOn: '2016-04-01 11:00:00',
    updatedOn: '2016-04-01 11:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-15T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          operator: 'in',
          values: ['114', '100001'],
          field: 'property',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          operator: 'gt',
          values: [1000],
          field: 'adClicks',
          parameters: {},
          type: 'metric',
        },
      ],
      columns: [
        {
          cid: 'n37Sjbv_2T',
          alias: null,
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'CGZkVPE2NT',
          alias: null,
          field: 'property',
          parameters: {
            field: 'desc',
          },
          type: 'dimension',
        },
        {
          cid: 'NLgyEKti-B',
          alias: null,
          field: 'adClicks',
          parameters: {},
          type: 'metric',
        },
        {
          cid: 'Z95IR60TwU',
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
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {},
      },
    },
  },
  {
    id: 3,
    title: 'Report 123',
    createdOn: '2015-01-01 02:00:00',
    updatedOn: '2015-01-01 02:00:00',
    ownerId: 'ciela',
    deliveryRuleIds: [1],
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {},
      },
    },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-15T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'x-4HGDijX7',
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'I4CO1UyJ9Z',
          field: 'adClicks',
          parameters: {},
          type: 'metric',
        },
        {
          cid: 'cZ1EsAC8X1',
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
  },
  {
    id: 4,
    title: 'Report 12',
    createdOn: '2015-01-03 00:00:00',
    updatedOn: '2015-01-03 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [2],
    visualization: {
      type: 'line-chart',
      version: 2,
      metadata: { axis: { y: { series: { type: 'metric', config: {} } } } },
    },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-15T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'HqoHEl9fOm',
          alias: null,
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
        { cid: '8C8dtbrp_b', alias: null, field: 'adClicks', parameters: {}, type: 'metric' },
        { cid: 'MStyAbA2sg', alias: null, field: 'navClicks', parameters: {}, type: 'metric' },
      ],
      table: 'network',
      sorts: [],
      rollup: { columnCids: [], grandTotal: false },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne',
    },
  },
  {
    id: 5,
    title: 'Null Visualization',
    createdOn: '2015-07-01 00:00:00',
    updatedOn: '2015-07-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: null,
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-15T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'AXeG921x3K',
          alias: null,
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
        { cid: 'XnnuhOJR6q', alias: null, field: 'adClicks', parameters: {}, type: 'metric' },
        { cid: 'qeln5JtJdK', alias: null, field: 'navClicks', parameters: {}, type: 'metric' },
      ],
      table: 'network',
      sorts: [],
      rollup: { columnCids: [], grandTotal: false },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne',
    },
  },
  {
    id: 6,
    title: 'Invalid report',
    createdOn: '2015-04-01 00:00:00',
    updatedOn: '2015-04-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: null,
    request: {
      table: 'network',
      dataSource: 'bardOne',
      requestVersion: '2.0',
      limit: null,
      columns: [],
      filters: [],
      sorts: [],
    },
  },
  {
    id: 7,
    title: 'Revenue report 1',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    ownerId: 'ciela',
    deliveryRuleIds: [],
    visualization: { type: 'table', version: 2, metadata: { columnAttributes: {} } },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2018-02-09T00:00:00.000Z', '2018-02-15T00:00:00.000Z'],
          field: 'tableA.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
        {
          operator: 'gte',
          values: ['2021-10-02'],
          field: 'userSignupDate',
          parameters: { field: 'id', grain: 'second' },
          type: 'timeDimension',
        },
        {
          operator: 'lte',
          values: ['2021-10-09T00:00:00.000Z'],
          field: 'userSignupDate',
          parameters: { field: 'id', grain: 'second' },
          type: 'timeDimension',
        },
        {
          operator: 'bet',
          values: ['2021-09-04', '2021-09-08'],
          field: 'userSignupDate',
          parameters: { field: 'id', grain: 'second' },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'wKt1t2EpBl',
          alias: null,
          field: 'tableA.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
        {
          cid: 'x6SyeNunSC',
          alias: null,
          field: 'userSignupDate',
          parameters: { field: 'id', grain: 'second' },
          type: 'timeDimension',
        },
        { cid: 'Hc_dQZXzln', alias: null, field: 'revenue', parameters: { currency: 'USD' }, type: 'metric' },
      ],
      table: 'tableA',
      sorts: [],
      rollup: { columnCids: [], grandTotal: false },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne',
    },
  },
  {
    id: 9,
    title: 'Report with unknown table',
    createdOn: '2015-02-01 00:00:00',
    updatedOn: '2015-02-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: { type: 'table', version: 2, metadata: { columnAttributes: {} } },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2018-02-09T00:00:00.000Z', '2018-02-15T00:00:00.000Z'],
          field: 'oak.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
      ],
      columns: [
        { cid: 'ATnJohxvUq', alias: null, field: 'oak.dateTime', parameters: { grain: 'day' }, type: 'timeDimension' },
        { cid: 'cG9Irk0U7K', alias: null, field: 'revenue', parameters: { currency: 'USD' }, type: 'metric' },
      ],
      table: 'oak',
      sorts: [],
      rollup: { columnCids: [], grandTotal: false },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne',
    },
  },
  {
    id: 10,
    title: 'Report with missing intervals',
    createdOn: '2018-01-01 00:00:00',
    updatedOn: '2018-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'line-chart',
      version: 2,
      metadata: { axis: { y: { series: { type: 'metric', config: {} } } } },
    },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['2018-11-11T00:00:00.000Z', '2018-11-17T00:00:00.000Z'],
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
      ],
      columns: [
        {
          cid: 'uCFNyC7CfV',
          alias: null,
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          type: 'timeDimension',
        },
        { cid: 'CryGpG7mra', alias: null, field: 'uniqueIdentifier', parameters: {}, type: 'metric' },
      ],
      table: 'network',
      sorts: [],
      rollup: { columnCids: [], grandTotal: false },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardOne',
    },
  },
  {
    id: 12,
    title: 'Report for different datasource',
    createdOn: '2020-01-01 00:00:00',
    updatedOn: '2020-01-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {},
      },
    },
    request: {
      filters: [
        {
          operator: 'bet',
          values: ['P3D', 'current'],
          field: 'inventory.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          operator: 'in',
          values: ['2'],
          field: 'container',
          parameters: {
            field: 'id',
          },
          type: 'dimension',
        },
        {
          operator: 'gt',
          values: [50],
          field: 'usedAmount',
          parameters: {},
          type: 'metric',
        },
      ],
      columns: [
        {
          cid: '8fRAf4_kRJ',
          alias: null,
          field: 'inventory.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: '_HipclSRk2',
          alias: null,
          field: 'container',
          parameters: {
            field: 'desc',
          },
          type: 'dimension',
        },
        {
          cid: 'eXnVmcRidU',
          alias: null,
          field: 'displayCurrency',
          parameters: {
            field: 'desc',
          },
          type: 'dimension',
        },
        {
          cid: 'NA-MqnxCRm',
          alias: null,
          field: 'usedAmount',
          parameters: {},
          type: 'metric',
        },
        {
          cid: '5JHUPNr4p4',
          alias: null,
          field: 'revenue',
          parameters: {
            currency: 'GIL',
          },
          type: 'metric',
        },
      ],
      table: 'inventory',
      sorts: [],
      rollup: {
        columnCids: [],
        grandTotal: false,
      },
      limit: null,
      requestVersion: '2.0',
      dataSource: 'bardTwo',
    },
  },
  {
    id: 13,
    title: 'RequestV2 testing report',
    createdOn: '2015-04-01 00:00:00',
    updatedOn: '2015-04-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          c1: { canAggregateSubtotal: false },
          c3: { canAggregateSubtotal: false },
          c2: { canAggregateSubtotal: false },
        },
        showTotals: {},
      },
    },
    request: {
      table: 'network',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          source: 'bardOne',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['2015-10-02T00:00:00.000Z', '2015-10-14T00:00:00.000Z'],
        },
      ],
      columns: [
        {
          cid: 'c1',
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'c2',
          type: 'metric',
          field: 'adClicks',
          parameters: {},
        },
        {
          cid: 'c3',
          type: 'dimension',
          field: 'property',
          parameters: { field: 'id' },
        },
      ],
      sorts: [],
    },
  },
  {
    id: 14,
    title: 'RequestV2 multi-param testing report',
    createdOn: '2015-04-01 00:00:00',
    updatedOn: '2015-04-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          c1: { canAggregateSubtotal: false },
          c3: { canAggregateSubtotal: false },
          c2: { canAggregateSubtotal: false },
        },
        showTotals: {},
      },
    },
    request: {
      table: 'network',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          dataSource: 'bardOne',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['2015-10-02T00:00:00.000Z', '2015-10-14T00:00:00.000Z'],
        },
      ],
      columns: [
        {
          cid: 'c1',
          field: 'network.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
        {
          cid: 'c2',
          type: 'metric',
          field: 'multipleParamMetric',
          parameters: {
            currency: 'EUR',
            age: '6',
          },
        },
        {
          cid: 'c3',
          type: 'dimension',
          field: 'property',
          parameters: { field: 'id' },
        },
      ],
      sorts: [],
    },
  },
  {
    id: 15,
    title: 'Unauthorized',
    createdOn: '2015-04-01 00:00:00',
    updatedOn: '2015-04-01 00:00:00',
    ownerId: 'navi_user',
    deliveryRuleIds: [],
    visualization: {
      type: 'table',
      version: 2,
      metadata: {
        columnAttributes: {
          c1: { canAggregateSubtotal: false },
        },
        showTotals: {},
      },
    },
    request: {
      table: 'protected',
      dataSource: 'bardOne',
      limit: null,
      requestVersion: '2.0',
      filters: [
        {
          type: 'timeDimension',
          dataSource: 'bardOne',
          field: 'protected.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['2015-10-02T00:00:00.000Z', '2015-10-14T00:00:00.000Z'],
        },
      ],
      columns: [
        {
          cid: 'c1',
          field: 'protected.dateTime',
          parameters: {
            grain: 'day',
          },
          type: 'timeDimension',
        },
      ],
      sorts: [],
    },
  },
];
