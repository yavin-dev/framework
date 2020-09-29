import EmberObject, { get } from '@ember/object';
import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import BuilderClass from 'navi-core/chart-builders/metric';
//@ts-ignore
import TooltipTemplate from '../../../../navi-core/templates/chart-tooltips/metric';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

const MetricChartBuilder = BuilderClass.create();

const DATA = [
    {
      dateTime: '2016-05-30 00:00:00.000',
      uniqueIdentifier: 172933788,
      totalPageViews: 3669828357
    },
    {
      dateTime: '2016-05-31 00:00:00.000',
      uniqueIdentifier: 183206656,
      totalPageViews: 4088487125
    },
    {
      dateTime: '2016-06-01 00:00:00.000',
      uniqueIdentifier: 183380921,
      totalPageViews: 4024700302
    },
    {
      dateTime: '2016-06-02 00:00:00.000',
      uniqueIdentifier: 180559793,
      totalPageViews: 3950276031
    },
    {
      dateTime: '2016-06-03 00:00:00.000',
      uniqueIdentifier: 172724594,
      totalPageViews: 3697156058
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

module('Unit | Chart Builders | Metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    setOwner(MetricChartBuilder, this.owner);
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('buildData - no metrics', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      MetricChartBuilder.buildData(DATA, { metrics: [] }, REQUEST),
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
      'No series are made when no metrics are requested'
    );
  });

  test('groupDataBySeries - many metrics', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      MetricChartBuilder.buildData(
        DATA,
        {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            },
            {
              metric: 'uniqueIdentifier',
              parameters: {},
              canonicalName: 'uniqueIdentifier'
            }
          ]
        },
        REQUEST
      ),
      [
        {
          x: {
            rawValue: '2016-05-30 00:00:00.000',
            displayValue: 'May 30'
          },
          'Total Page Views': 3669828357,
          'Unique Identifiers': 172933788
        },
        {
          x: {
            rawValue: '2016-05-31 00:00:00.000',
            displayValue: 'May 31'
          },
          'Total Page Views': 4088487125,
          'Unique Identifiers': 183206656
        },
        {
          x: {
            rawValue: '2016-06-01 00:00:00.000',
            displayValue: 'Jun 1'
          },
          'Total Page Views': 4024700302,
          'Unique Identifiers': 183380921
        },
        {
          x: {
            rawValue: '2016-06-02 00:00:00.000',
            displayValue: 'Jun 2'
          },
          'Total Page Views': 3950276031,
          'Unique Identifiers': 180559793
        },
        {
          x: {
            rawValue: '2016-06-03 00:00:00.000',
            displayValue: 'Jun 3'
          },
          'Total Page Views': 3697156058,
          'Unique Identifiers': 172724594
        }
      ],
      'A series is made for each requested metric'
    );
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
          dateTime: '2016-06-02 00:00:00.000',
          totalPageViews: 3669828357
        }
      ];

    assert.deepEqual(
      MetricChartBuilder.buildData(
        data,
        {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            },
            {
              metric: 'uniqueIdentifier',
              parameters: {},
              canonicalName: 'uniqueIdentifier'
            }
          ]
        },
        request
      ),
      [
        {
          x: {
            rawValue: '2016-06-01 00:00:00.000',
            displayValue: 'Jun 1'
          },
          'Total Page Views': null,
          'Unique Identifiers': null
        },
        {
          x: {
            rawValue: '2016-06-02 00:00:00.000',
            displayValue: 'Jun 2'
          },
          'Total Page Views': 3669828357,
          'Unique Identifiers': null
        }
      ],
      'Missing data points are filled with null values'
    );
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
          dateTime: '2016-05-31 00:00:00.000',
          totalPageViews: 3669828357
        },
        {
          dateTime: '2016-05-31 01:00:00.000',
          totalPageViews: 4088487125
        }
      ];

    assert.deepEqual(
      MetricChartBuilder.buildData(
        data,
        {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            }
          ]
        },
        request
      ),
      [
        {
          x: {
            rawValue: '2016-05-31 00:00:00.000',
            displayValue: '00:00'
          },
          'Total Page Views': 3669828357
        },
        {
          x: {
            rawValue: '2016-05-31 01:00:00.000',
            displayValue: '01:00'
          },
          'Total Page Views': 4088487125
        }
      ],
      'A series has the properly formmatted displayValue'
    );
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
          dateTime: '2016-12-01 00:00:00.000',
          totalPageViews: 3669828357
        },
        {
          dateTime: '2017-01-01 00:00:00.000',
          totalPageViews: 4088487125
        }
      ];

    assert.deepEqual(
      MetricChartBuilder.buildData(
        data,
        {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            }
          ]
        },
        request
      ),
      [
        {
          x: {
            rawValue: '2016-12-01 00:00:00.000',
            displayValue: 'Dec 2016'
          },
          'Total Page Views': 3669828357
        },
        {
          x: {
            rawValue: '2017-01-01 00:00:00.000',
            displayValue: 'Jan 2017'
          },
          'Total Page Views': 4088487125
        }
      ],
      'A series has the properly formmatted displayValue'
    );
  });

  test('Zero in chart data', function(assert) {
    assert.expect(1);

    let request = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-06-02 00:00:00.000',
            end: '2016-06-03 00:00:00.000'
          }
        ]
      },
      data = [
        {
          dateTime: '2016-06-02 00:00:00.000',
          totalPageViews: 0
        }
      ];

    assert.deepEqual(
      MetricChartBuilder.buildData(
        data,
        {
          metrics: [
            { metric: 'totalPageViews', canonicalName: 'totalPageViews' },
            { metric: 'uniqueIdentifier', canonicalName: 'uniqueIdentifier' }
          ]
        },
        request
      ),
      [
        {
          x: {
            rawValue: '2016-06-02 00:00:00.000',
            displayValue: 'Jun 2'
          },
          'Total Page Views': 0,
          'Unique Identifiers': null
        }
      ],
      'Zero values are not considered gaps in data'
    );
  });

  test('buildTooltip', function(assert) {
    assert.expect(2);

    let config = {
        metrics: [
          {
            metric: 'totalPageViews',
            parameters: {},
            canonicalName: 'totalPageViews'
          },
          {
            metric: 'uniqueIdentifier',
            parameters: {},
            canonicalName: 'uniqueIdentifier'
          }
        ]
      },
      x = '2016-06-02 00:00:00.000',
      tooltipData = [
        {
          x,
          name: 'Unique Identifiers',
          value: 180559793
        }
      ];

    //Populates the 'byXSeries' property in the builder that buildTooltip uses
    MetricChartBuilder.buildData(DATA, config, REQUEST);

    let mixin = MetricChartBuilder.buildTooltip(DATA, config, REQUEST),
      tooltipClass = EmberObject.extend(mixin, {}),
      tooltip = tooltipClass.create({ config, REQUEST, tooltipData, x });

    assert.equal(get(tooltip, 'layout'), TooltipTemplate, 'Tooltip uses metric tooltip template');

    assert.deepEqual(get(tooltip, 'rowData'), [DATA[3]], 'The correct response row is given to the tooltip');
  });
});
