/**
 * Copyright 2017, Yahoo Holdings Inc.
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
    author: 'navi_user',
    deliveryRules: [],
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'dimension',
              config: {
                metric: 'adClicks',
                dimensionOrder: [ 'property' ],
                dimensions: [
                  {  name: 'Property 1', values: {  property: '114' } },
                  {  name: 'Property 2', values: {  property: '100001' } },
                  {  name: 'Property 3', values: {  property: '100002' } }
                ]
              }
            }
          }
        }
      }
    },
    request: {
      logicalTable: {
        table: 'network',
        timeGrain: 'day'
      },
      metrics: [
        { metric: 'adClicks' },
        { metric: 'navClicks' }
      ],
      dimensions: [
        { dimension: 'property' }
      ],
      filters: [],
      sort: [
        {
          metric: 'navClicks',
          direction: 'asc'
        }
      ],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      bardVersion:    'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 2,
    title: 'Hyrule Ad&Nav Clicks',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    author: 'navi_user',
    deliveryRules: [],
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
            field: 'property',
            type: 'dimension',
            displayName: 'Property'
          },
          {
            field: 'adClicks',
            type: 'metric',
            displayName: 'Ad Clicks'
          },
          {
            field: 'navClicks',
            type: 'metric',
            displayName: 'Nav Clicks'
          }
        ]
      }
    },
    request: {
      logicalTable: {
        table: 'network',
        timeGrain: 'day'
      },
      metrics: [
        { metric: 'adClicks' },
        { metric: 'navClicks' }
      ],
      dimensions: [
        {
          dimension: 'property'
        }
      ],
      filters: [
        {
          dimension: 'property',
          operator: 'in',
          field: 'id',
          values: [ '114', '100001' ]
        }
      ],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      having: [
        { metric: 'adClicks', operator: 'gt', values: [1000] }
      ],
      bardVersion:    'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 3,
    title: 'Report 123',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    author: 'ciela',
    deliveryRules: [ 1 ],
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
            field: 'adClicks',
            type: 'metric',
            displayName: 'Ad Clicks'
          }
        ]
      }
    },
    request: {
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
      sort: [],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      bardVersion:    'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 4,
    title: 'Report 12',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    author: 'navi_user',
    deliveryRules: [ 2 ],
    visualization: {
      type: 'line-chart',
      version: 1,
      metadata: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {
                metrics: [ 'adClicks', 'navClicks' ]
              }
            }
          }
        }
      }
    },
    request: {
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
      sort: [],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      bardVersion:    'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 5,
    title: 'Null Visualization',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    author: 'navi_user',
    deliveryRules: [],
    visualization: null,
    request: {
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
      sort: [],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      bardVersion:    'v1',
      requestVersion: 'v1'
    }
  },
  {
    id: 6,
    title: 'Invalid report',
    createdOn: '2015-01-01 00:00:00',
    updatedOn: '2015-01-01 00:00:00',
    author: 'navi_user',
    deliveryRules: [],
    visualization: null,
    request: {
      logicalTable: {
        table: 'network',
        timeGrain: 'day'
      },
      metrics: [],
      dimensions: [],
      filters: [],
      intervals: [
        {
          end: '2015-11-16 00:00:00.000',
          start: '2015-11-09 00:00:00.000'
        }
      ],
      having: [
        { metric: 'adClicks', operator: 'gt', values: [] }
      ],
      bardVersion: 'v1',
      requestVersion: 'v1'
    }
  }
];
