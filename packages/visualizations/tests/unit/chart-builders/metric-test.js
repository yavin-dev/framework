import { test, module } from 'ember-qunit';
import BuilderClass from 'navi-visualizations/chart-builders/metric';
import TooltipTemplate from '../../../../navi-visualizations/templates/chart-tooltips/metric';

const MetricChartBuilder = BuilderClass.create();

const DATA = [
        {
          'dateTime': '2016-05-30 00:00:00.000',
          'uniqueIdentifier': 172933788,
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2016-05-31 00:00:00.000',
          'uniqueIdentifier': 183206656,
          'totalPageViews': 4088487125
        },
        {
          'dateTime': '2016-06-01 00:00:00.000',
          'uniqueIdentifier': 183380921,
          'totalPageViews': 4024700302
        },
        {
          'dateTime': '2016-06-02 00:00:00.000',
          'uniqueIdentifier': 180559793,
          'totalPageViews': 3950276031
        },
        {
          'dateTime': '2016-06-03 00:00:00.000',
          'uniqueIdentifier': 172724594,
          'totalPageViews': 3697156058
        }
      ],
      REQUEST = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-06-04 00:00:00.000'
          }
        ]
      };

module('Unit | Utils | Chart Builder Metric');

test('buildData - no metrics', function(assert) {
  assert.expect(1);

  assert.deepEqual(MetricChartBuilder.buildData(DATA, { metrics: []}, REQUEST),
    [
      {
        x: {
          rawValue: '2016-05-30 00:00:00.000',
          displayValue: 'May 30'
        }
      },
      {
        x: {
          rawValue: '2016-05-31 00:00:00.000',
          displayValue: 'May 31'
        }
      },
      {
        x: {
          rawValue: '2016-06-01 00:00:00.000',
          displayValue: 'Jun 1'
        }
      },
      {
        x: {
          rawValue: '2016-06-02 00:00:00.000',
          displayValue: 'Jun 2'
        }
      },
      {
        x: {
          rawValue: '2016-06-03 00:00:00.000',
          displayValue: 'Jun 3'
        }
      }
    ],
    'No series are made when no metrics are requested');
});

test('groupDataBySeries - many metrics', function(assert) {
  assert.expect(1);

  assert.deepEqual(MetricChartBuilder.buildData(DATA, { metrics: ['totalPageViews', 'uniqueIdentifier']}, REQUEST),
    [
      {
        x: {
          rawValue: '2016-05-30 00:00:00.000',
          displayValue: 'May 30'
        },
        totalPageViews: 3669828357,
        uniqueIdentifier: 172933788,
      },
      {
        x: {
          rawValue: '2016-05-31 00:00:00.000',
          displayValue: 'May 31'
        },
        totalPageViews: 4088487125,
        uniqueIdentifier: 183206656,
      },
      {
        x: {
          rawValue: '2016-06-01 00:00:00.000',
          displayValue: 'Jun 1'
        },
        totalPageViews: 4024700302,
        uniqueIdentifier: 183380921,
      },
      {
        x: {
          rawValue: '2016-06-02 00:00:00.000',
          displayValue: 'Jun 2'
        },
        totalPageViews: 3950276031,
        uniqueIdentifier: 180559793,
      },
      {
        x: {
          rawValue: '2016-06-03 00:00:00.000',
          displayValue: 'Jun 3'
        },
        totalPageViews: 3697156058,
        uniqueIdentifier: 172724594
      }
    ],
    'A series is made for each requested metric');
});

test('groupDataBySeries - gaps in data', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-06-01 00:00:00.000',
            end: '2016-06-03 00:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-06-02 00:00:00.000',
          'totalPageViews': 3669828357
        }
      ];

  assert.deepEqual(MetricChartBuilder.buildData(data, { metrics: ['totalPageViews', 'uniqueIdentifier']}, request),
    [
      {
        x: {
          rawValue: '2016-06-01 00:00:00.000',
          displayValue: 'Jun 1'
        },
        totalPageViews: null,
        uniqueIdentifier: null,
      },
      {
        x: {
          rawValue: '2016-06-02 00:00:00.000',
          displayValue: 'Jun 2'
        },
        totalPageViews: 3669828357,
        uniqueIdentifier: null,
      }
    ],
    'Missing data points are filled with null values');
});

test('groupDataBySeries - hour granularity series', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'hour'
        },
        intervals: [
          {
            start: '2016-05-31 00:00:00.000',
            end: '2016-05-31 02:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-05-31 00:00:00.000',
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2016-05-31 01:00:00.000',
          'totalPageViews': 4088487125
        },
      ];

  assert.deepEqual(MetricChartBuilder.buildData(data, { metrics: ['totalPageViews']}, request),
    [
      {
        x: {
          rawValue: '2016-05-31 00:00:00.000',
          displayValue: '00:00'
        },
        totalPageViews: 3669828357,
      },
      {
        x: {
          rawValue: '2016-05-31 01:00:00.000',
          displayValue: '01:00'
        },
        totalPageViews: 4088487125,
      }
    ],
    'A series has the properly formmatted displayValue');
});

test('groupDataBySeries - month granularity series', function(assert) {
  assert.expect(1);

  let request = {
        logicalTable: {
          timeGrain: 'month'
        },
        intervals: [
          {
            start: '2016-12-01 00:00:00.000',
            end: '2017-02-01 01:00:00.000'
          }
        ]
      },
      data = [
        {
          'dateTime': '2016-12-01 00:00:00.000',
          'totalPageViews': 3669828357
        },
        {
          'dateTime': '2017-01-01 00:00:00.000',
          'totalPageViews': 4088487125
        },
      ];

  assert.deepEqual(MetricChartBuilder.buildData(data, { metrics: ['totalPageViews']}, request),
    [
      {
        x: {
          rawValue: '2016-12-01 00:00:00.000',
          displayValue: 'Dec 2016'
        },
        totalPageViews: 3669828357,
      },
      {
        x: {
          rawValue: '2017-01-01 00:00:00.000',
          displayValue: 'Jan 2017'
        },
        totalPageViews: 4088487125,
      }
    ],
    'A series has the properly formmatted displayValue');
});

test('buildTooltip', function(assert) {
  assert.expect(1);

  assert.equal(MetricChartBuilder.buildTooltip().layout,
    TooltipTemplate,
    'Tooltip uses metric template');
});
