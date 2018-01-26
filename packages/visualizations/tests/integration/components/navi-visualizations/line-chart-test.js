import Ember from 'ember';
import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements} from 'navi-visualizations/initializers/inject-c3-enhancements';
import DateUtils from 'navi-core/utils/date';

const TEMPLATE = hbs`
  {{navi-visualizations/line-chart
    model=model
    options=options
  }}`;

const Model = Ember.A([{
  request: {
    metrics: [
      'uniqueIdentifier', 'totalPageViews'
    ],
    intervals: [
      {
        start: '2016-05-30 00:00:00.000',
        end: '2016-06-04 00:00:00.000'
      }
    ],
    logicalTable: {
      timeGrain: 'day'
    }
  },
  response: {
    rows: [
      {
        "dateTime": "2016-05-30 00:00:00.000",
        "uniqueIdentifier": 172933788,
        "totalPageViews": 3669828357
      },
      {
        "dateTime": "2016-05-31 00:00:00.000",
        "uniqueIdentifier": 183206656,
        "totalPageViews": 4088487125
      },
      {
        "dateTime": "2016-06-01 00:00:00.000",
        "uniqueIdentifier": 183380921,
        "totalPageViews": 4024700302
      },
      {
        "dateTime": "2016-06-02 00:00:00.000",
        "uniqueIdentifier": 180559793,
        "totalPageViews": 3950276031
      },
      {
        "dateTime": "2016-06-03 00:00:00.000",
        "uniqueIdentifier": 172724594,
        "totalPageViews": 3697156058
      }
    ]
  }
}]);

moduleForComponent('navi-visualizations/line-chart', 'Integration | Component | line chart', {
  integration: true,
  beforeEach() {
    injectC3Enhancements();
    this.set('model', Model);
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [ 'uniqueIdentifier' ]
            }
          }
        }
      }
    });

    injectC3Enhancements();
  }
});

test('it renders', function(assert) {
  assert.expect(2);

  this.render(TEMPLATE);

  assert.ok(this.$('.navi-vis-c3-chart').is(':visible'),
    'The line chart widget component is visible');

  assert.equal(this.$('.c3-chart-line').length,
    1,
    'One chart line is present on the chart');
});

test('missing data - metrics', function(assert) {
  assert.expect(1);

  this.set('model', Ember.A([{
    request: {
      metrics: [
        'uniqueIdentifier'
      ],
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-02 00:00:00.000'
        }
      ],
      logicalTable: {
        timeGrain: 'day'
      }
    },
    response: {
      rows: [
        {
          "dateTime": "2016-05-30 00:00:00.000",
          "uniqueIdentifier": 172933788
        },
        {
          "dateTime": "2016-06-01 00:00:00.000",
          "uniqueIdentifier": 183380921
        }
      ]
    }
  }]));

  this.render(TEMPLATE);

  assert.deepEqual(this.$('.c3-circle').map(function() { return $(this).css('opacity'); }).get(),
    [
      '1',
      '0',
      '1'
    ],
    'Missing data points are hidden by the chart');
});

test('missing data - dimensions', function(assert) {
  assert.expect(1);

  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'dimension',
          config: {
            metric: 'uniqueIdentifier',
            dimensionOrder: ['age'],
            dimensions: [
              {
                name: 'All Other',
                values: {age: '-3'}
              }
            ]
          }
        }
      }
    }
  });

  this.set('model', Ember.A([{
    request: {
      metrics: [
        'uniqueIdentifier'
      ],
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-02 00:00:00.000'
        }
      ],
      logicalTable: {
        timeGrain: 'day'
      }
    },
    response: {
      rows: [
        {
          "dateTime": "2016-05-30 00:00:00.000",
          "age|id": "-3",
          "age|desc": "All Other",
          "uniqueIdentifier": 172933788
        },
        {
          "dateTime": "2016-06-01 00:00:00.000",
          "age|id": "-3",
          "age|desc": "All Other",
          "uniqueIdentifier": 183380921
        }
      ]
    }
  }]));

  this.render(TEMPLATE);

  assert.deepEqual(this.$('.c3-circle').map(function() { return $(this).css('opacity'); }).get(),
    [
      '1',
      '0',
      '1'
    ],
    'Missing data points are hidden by the chart');
});

test('multiple series', function(assert) {
  assert.expect(1);

  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: [ 'uniqueIdentifier', 'totalPageViews' ]
          }
        }
      }
    }
  });

  this.set('model', Model);
  this.render(TEMPLATE);

  assert.equal(this.$('.c3-chart-line').length,
    2,
    'Two chart lines are present in the chart based on the metrics in the request');
});

test('y axis label', function(assert) {
  assert.expect(2);

  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'dimension',
          config: {
            metric: 'totalPageViews',
            dimensionOrder: ['age'],
            dimensions: [
              {
                name: 'All Other',
                values: {age: '-3'}
              },
              {
                name: 'under 13',
                values: {age: '1'}
              },
              {
                name: '13 - 25',
                values: {age: '2'}
              },
              {
                name: '25 - 35',
                values: {age: '3'}
              },
              {
                name: '35 - 45',
                values: {age: '4'}
              }
            ]
          }
        }
      }
    }
  });

  this.set('model', Model);
  this.render(TEMPLATE);

  assert.equal(this.$('.c3-axis-y-label').text(),
    'totalPageViews',
    'The metric name is displayed in the y axis label correctly for a dimension chart');

  //set chart type to metric
  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: [ 'uniqueIdentifier', 'totalPageViews' ]
          }
        }
      }
    }
  });

  assert.equal(this.$('.c3-axis-y-label').text(),
    '',
    'The y axis label is not displayed for a metric chart.');
});


test('Highlight data points', function(assert) {
  // assert.expect(1);

  let anomalousDataModel = Ember.A([
    {
      request: {
        metrics: [
          "uniqueIdentifier"
        ],
        logicalTable: {
          timeGrain: "day"
        },
        intervals: [
          {
            start: "2017-09-01 00:00:00.000",
            end: "2017-09-07 00:00:00.000"
          }
        ]
      },
      response: {
        "rows": [
          {
            "dateTime": "2017-09-01 00:00:00.000",
            "uniqueIdentifier": 155191081
          },
          {
            "dateTime": "2017-09-02 00:00:00.000",
            "uniqueIdentifier": 172724594
          },
          {
            "dateTime": "2017-09-03 00:00:00.000",
            "uniqueIdentifier": 183380921
          },
          {
            "dateTime": "2017-09-04 00:00:00.000",
            "uniqueIdentifier": 172933788
          },
          {
            "dateTime": "2017-09-05 00:00:00.000",
            "uniqueIdentifier": 183206656
          },
          {
            "dateTime": "2017-09-06 00:00:00.000",
            "uniqueIdentifier": 183380921
          },
          {
            "dateTime": "2017-09-07 00:00:00.000",
            "uniqueIdentifier": 180559793
          }
        ]
      }
    },
    new Ember.RSVP.Promise((resolve) => {
      resolve(Ember.A([
        {
          index: 1,
          actual: 12,
          predicted: 172724594.12345,
          standardDeviation: 123.123456
        },
        {
          index: 3,
          actual: 10,
          predicted: 172933788.12345,
          standardDeviation: 123.123456
        },
        {
          index: 5,
          actual: 14,
          predicted: 183380921.12345,
          standardDeviation: 123.123456
        }
      ]));
    })
  ]);

  this.set('model', anomalousDataModel);
  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: ['uniqueIdentifier']
          }
        }
      }
    }
  });
  this.render(TEMPLATE);

  assert.equal(this.$('.c3-selected-circles circle').length,
    3,
    'Three data points are hightlighted in chart');
});


test('dateTime model', function (assert) {
  assert.expect(1);
  let start = moment('2016-05-01 00:00:00.000'),
      end = moment('2018-07-01 00:00:00.000'),
      current = start.clone(),
      rows = [];

  while (current.isBefore(end)) {
    rows.push({
      dateTime: current.format(DateUtils.API_DATE_FORMAT_STRING),
      uniqueIdentifier: Math.random() * 1000
    });

    current.add(1, 'month');
  }

  this.set('model', Ember.A([{
    request: {
      metrics: [
        'uniqueIdentifier'
      ],
      intervals: [
        {
          start: start.format(DateUtils.API_DATE_FORMAT_STRING),
          end: end.format(DateUtils.API_DATE_FORMAT_STRING)
        }
      ],
      logicalTable: {
        timeGrain: 'month'
      }
    },
    response: { rows }
  }]));
  this.set('options', {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: 'uniqueIdentifier',
            timeGrain: 'year'
          }
        }
      }
    }
  });

  this.render(TEMPLATE);

  assert.deepEqual(this.$('.c3-legend-item').map(function () { return $(this).text(); }).get(),
    [
      '2016',
      '2017',
      '2018'
    ],
    'Three years time series are displayed on y-axis');
});
