import Ember from 'ember';
import merge from 'lodash/merge';

const { get, set } = Ember;
export default Ember.Controller.extend({
  chartType: 'line-chart',

  //options passed through to the line-chart component
  request: {
    dimensions: [{
      dimension: {
        name: 'age',
        longName: 'Age'
      }
    }],
    metrics: [
      {
        metric: 'adClicks',
        canonicalName: 'adClicks',
        toJSON() { return this; }
      },
      {
        metric: 'uniqueIdentifier',
        canonicalName: 'uniqueIdentifier',
        toJSON() { return this; }
      },
      {
        metric: 'revenue',
        parameters: {
          currency: 'USD'
        },
        canonicalName: 'revenue(currency=USD)',
        toJSON() { return this; }
      }
    ]
  },

  response: Ember.computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  metricOptions: {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: [
              {
                metric: 'uniqueIdentifier',
                parameters: {},
                canonicalName: 'uniqueIdentifier'
              },
              {
                metric: 'totalPageViews',
                parameters: {},
                canonicalName: 'totalPageViews'
              },
              {
                metric: 'revenue',
                parameters: {
                  currency: 'USD'
                },
                canonicalName: 'revenue(currency=USD)'
              }
            ]
          }
        }
      }
    }
  },

  dimensionOptions: {
    axis: {
      y: {
        series: {
          type: 'dimension',
          config: {
            metric: {
              metric: 'adClicks',
              parameters: {},
              canonicalName: 'adClicks',
              toJSON() { return this; }
            },
            dimensionOrder: ['age'],
            dimensions: [
              {
                name: 'All Other',
                values: {age: '-3'}
              },
              {
                name: '13-25',
                values: {age: '2'}
              },
              {
                name: '21-24',
                values: {age: '4'}
              },
              {
                name: '25-29',
                values: {age: '5'}
              }
            ]
          }
        }
      }
    }
  },

  metricVisualization: Ember.computed('metricOptions', function() {
    return {
      type: get(this, 'chartType'),
      version: 1,
      metadata: Ember.get(this, 'metricOptions')
    };
  }),

  dimVisualization: Ember.computed('dimensionOptions', function() {
    return {
      type: get(this, 'chartType'),
      version: 1,
      metadata: Ember.get(this, 'dimensionOptions')
    };
  }),

  timeOptions: {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: { metric: 'totalPageViews', parameters: {}, canonicalName: 'totalPageViews' },
            timeGrain: 'year'
          }
        }
      }
    }
  },

  customOptions: {
    axis: {
      y: {
        series: {
          type: 'customType',
        }
      }
    }
  },

  dimensionModel: Ember.A([
    {
      request: {
        metrics: [
          {
            metric: 'adClicks',
            canonicalName: 'adClicks',
            toJSON() { return this; }
          },
          {
            metric: 'uniqueIdentifier',
            canonicalName: 'uniqueIdentifier',
            toJSON() { return this; }
          },
          {
            metric: 'revenue',
            parameters: {
              currency: 'USD'
            },
            canonicalName: 'revenue(currency=USD)',
            toJSON() { return this; }
          }
        ],
        logicalTable: {
          timeGrain: "day"
        },
        intervals: [
          {
            start: "2017-02-09 00:00:00.000",
            end: "2017-02-19 00:00:00.000"
          }
        ],
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 112619, "revenue(currency=USD)": 93234.32304, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 102039, "revenue(currency=USD)": 67234.12663, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 99890, "revenue(currency=USD)": 12498.12298, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 95337, "revenue(currency=USD)": 43992.98540, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 58507, "revenue(currency=USD)": 78332.98822, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 47163, "revenue(currency=USD)": 101242.53242, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 35183, "revenue(currency=USD)": 120249.93840, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 32758, "revenue(currency=USD)": 115234.33482, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-18 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "adClicks": 32024, "revenue(currency=USD)": 98123.34991, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 62029, "revenue(currency=USD)": 89129.75744, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 95170, "revenue(currency=USD)": 77234.99801, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 135196, "revenue(currency=USD)": 93221.12390, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 158796, "revenue(currency=USD)": 105882.99283, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 166673, "revenue(currency=USD)": 100000.12312, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 186524, "revenue(currency=USD)": 96234.09383, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 164860, "revenue(currency=USD)": 140243.77293, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-18 00:00:00.000", "age|id": "4", "age|desc": "21-24", "adClicks": 167813, "revenue(currency=USD)": 147992.84392, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-09 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 184985, "revenue(currency=USD)": 149234.88192, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 196688, "revenue(currency=USD)": 156234.88239, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 176962, "revenue(currency=USD)": 150532.81759, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 151662, "revenue(currency=USD)": 135998.37414, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 141660, "revenue(currency=USD)": 129352.99810, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 130757, "revenue(currency=USD)": 120342.84859, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 115753, "revenue(currency=USD)": 99157.66384, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "5", "age|desc": "25-29", "adClicks": 93722, "revenue(currency=USD)": 80500.77383, 'uniqueIdentifier': 100 }
        ]
      }
    }
  ]),

  hourGrainModel: Ember.A([
    {
      request: {
        metrics: [
          {
            metric: 'adClicks',
            canonicalName: 'adClicks',
            toJSON() { return this; }
          }
        ],
        logicalTable: {
          timeGrain: "hour"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "adClicks": 112619 },
          { "dateTime": "2017-02-09 01:00:00.000", "adClicks": 102039 },
          { "dateTime": "2017-02-09 02:00:00.000", "adClicks": 99890 },
          { "dateTime": "2017-02-09 03:00:00.000", "adClicks": 95337 },
          { "dateTime": "2017-02-09 04:00:00.000", "adClicks": 77736 },
          { "dateTime": "2017-02-09 05:00:00.000", "adClicks": 58507 },
          { "dateTime": "2017-02-09 06:00:00.000", "adClicks": 47163 },
          { "dateTime": "2017-02-09 07:00:00.000", "adClicks": 35183 },
          { "dateTime": "2017-02-09 08:00:00.000", "adClicks": 32758 },
          { "dateTime": "2017-02-09 09:00:00.000", "adClicks": 32024 },
          { "dateTime": "2017-02-09 10:00:00.000", "adClicks": 44904 },
          { "dateTime": "2017-02-09 11:00:00.000", "adClicks": 62029 },
          { "dateTime": "2017-02-09 12:00:00.000", "adClicks": 95170 },
          { "dateTime": "2017-02-09 13:00:00.000", "adClicks": 135196 },
          { "dateTime": "2017-02-09 14:00:00.000", "adClicks": 163283 },
          { "dateTime": "2017-02-09 15:00:00.000", "adClicks": 158796 },
          { "dateTime": "2017-02-09 16:00:00.000", "adClicks": 166673 },
          { "dateTime": "2017-02-09 17:00:00.000", "adClicks": 186524 },
          { "dateTime": "2017-02-09 18:00:00.000", "adClicks": 164860 },
          { "dateTime": "2017-02-09 19:00:00.000", "adClicks": 167813 },
          { "dateTime": "2017-02-09 20:00:00.000", "adClicks": 184985 },
          { "dateTime": "2017-02-09 21:00:00.000", "adClicks": 196688 },
          { "dateTime": "2017-02-09 22:00:00.000", "adClicks": 176962 },
          { "dateTime": "2017-02-09 23:00:00.000", "adClicks": 151662 },
          { "dateTime": "2017-02-10 00:00:00.000", "adClicks": 156158 },
          { "dateTime": "2017-02-10 01:00:00.000", "adClicks": 141660 },
          { "dateTime": "2017-02-10 02:00:00.000", "adClicks": 130757 },
          { "dateTime": "2017-02-10 03:00:00.000", "adClicks": 115753 },
          { "dateTime": "2017-02-10 04:00:00.000", "adClicks": 93722 },
          { "dateTime": "2017-02-10 05:00:00.000", "adClicks": 0 },
          { "dateTime": "2017-02-10 06:00:00.000", "adClicks": 42930 },
          { "dateTime": "2017-02-10 07:00:00.000", "adClicks": 38197 },
          { "dateTime": "2017-02-10 08:00:00.000", "adClicks": 35524 },
          { "dateTime": "2017-02-10 09:00:00.000", "adClicks": 33151 },
          { "dateTime": "2017-02-10 10:00:00.000", "adClicks": 41540 },
          { "dateTime": "2017-02-10 11:00:00.000", "adClicks": 67897 },
          { "dateTime": "2017-02-10 12:00:00.000", "adClicks": 102692 },
          { "dateTime": "2017-02-10 13:00:00.000", "adClicks": 148882 },
          { "dateTime": "2017-02-10 14:00:00.000", "adClicks": 178171 },
          { "dateTime": "2017-02-10 15:00:00.000", "adClicks": 195863 },
          { "dateTime": "2017-02-10 16:00:00.000", "adClicks": 189377 },
          { "dateTime": "2017-02-10 17:00:00.000", "adClicks": 210462 },
          { "dateTime": "2017-02-10 18:00:00.000", "adClicks": 204357 },
          { "dateTime": "2017-02-10 19:00:00.000", "adClicks": 195042 },
          { "dateTime": "2017-02-10 20:00:00.000", "adClicks": 201723 },
          { "dateTime": "2017-02-10 21:00:00.000", "adClicks": 190928 },
          { "dateTime": "2017-02-10 22:00:00.000", "adClicks": 156252 },
          { "dateTime": "2017-02-10 23:00:00.000", "adClicks": 132054 }
        ]
      }
    }
  ]),

  hourByDayTimeOptions: {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: { metric: 'adClicks', parameters: {}, canonicalName: 'adClicks', toJSON() { return this; } },
            timeGrain: 'day'
          }
        }
      }
    }
  },

  minuteGrainModel: Ember.A([
    {
      request: {
        metrics: [
          { metric: 'adClicks', parameters: {}, canonicalName: 'adClicks', toJSON() { return this; } }
        ],
        logicalTable: {
          timeGrain: "minute"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "adClicks": 112619 },
          { "dateTime": "2017-02-09 00:01:00.000", "adClicks": 44904 },
          { "dateTime": "2017-02-09 00:02:00.000", "adClicks": 102039 },
          { "dateTime": "2017-02-09 00:03:00.000", "adClicks": 99890 },
          { "dateTime": "2017-02-09 00:04:00.000", "adClicks": 95337 },
          { "dateTime": "2017-02-09 00:05:00.000", "adClicks": 77736 },
          { "dateTime": "2017-02-09 00:06:00.000", "adClicks": 58507 },
          { "dateTime": "2017-02-09 00:07:00.000", "adClicks": 47163 },
          { "dateTime": "2017-02-09 00:08:00.000", "adClicks": 35183 },
          { "dateTime": "2017-02-09 00:09:00.000", "adClicks": 32758 },
          { "dateTime": "2017-02-09 00:10:00.000", "adClicks": 32024 },
          { "dateTime": "2017-02-09 01:00:00.000", "adClicks": 44904 },
          { "dateTime": "2017-02-09 01:01:00.000", "adClicks": 62029 },
          { "dateTime": "2017-02-09 01:02:00.000", "adClicks": 95170 },
          { "dateTime": "2017-02-09 01:03:00.000", "adClicks": 135196 },
          { "dateTime": "2017-02-09 01:04:00.000", "adClicks": 163283 },
          { "dateTime": "2017-02-09 01:05:00.000", "adClicks": 158796 },
          { "dateTime": "2017-02-09 01:06:00.000", "adClicks": 166673 },
          { "dateTime": "2017-02-09 01:07:00.000", "adClicks": 186524 },
          { "dateTime": "2017-02-09 01:08:00.000", "adClicks": 164860 },
          { "dateTime": "2017-02-09 01:09:00.000", "adClicks": 167813 },
          { "dateTime": "2017-02-09 01:10:00.000", "adClicks": 184985 },
          { "dateTime": "2017-02-09 02:00:00.000", "adClicks": 196688 },
          { "dateTime": "2017-02-09 02:01:00.000", "adClicks": 176962 },
          { "dateTime": "2017-02-09 02:02:00.000", "adClicks": 151662 },
          { "dateTime": "2017-02-09 02:03:00.000", "adClicks": 156158 },
          { "dateTime": "2017-02-09 02:04:00.000", "adClicks": 141660 },
          { "dateTime": "2017-02-09 02:05:00.000", "adClicks": 130757 },
          { "dateTime": "2017-02-09 02:06:00.000", "adClicks": 115753 },
          { "dateTime": "2017-02-09 02:07:00.000", "adClicks": 93722 },
          { "dateTime": "2017-02-09 02:08:00.000", "adClicks": 61043 },
          { "dateTime": "2017-02-09 02:09:00.000", "adClicks": 42930 },
          { "dateTime": "2017-02-09 02:10:00.000", "adClicks": 38197 }
        ]
      }
    }
  ]),

  minuteByHourTimeOptions: {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: { metric: 'adClicks', parameters: {}, canonicalName: 'adClicks', toJSON() { return this; } },
            timeGrain: 'hour'
          }
        }
      }
    }
  },

  secondGrainModel: Ember.A([
    {
      request: {
        metrics: [
          {
            metric: 'adClicks',
            canonicalName: 'adClicks',
            toJSON() { return this; }
          }
        ],
        logicalTable: {
          timeGrain: "second"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "adClicks": 112619 },
          { "dateTime": "2017-02-09 00:00:01.000", "adClicks": 99890 },
          { "dateTime": "2017-02-09 00:00:02.000", "adClicks": 102039 },
          { "dateTime": "2017-02-09 00:00:03.000", "adClicks": 99890 },
          { "dateTime": "2017-02-09 00:00:04.000", "adClicks": 95337 },
          { "dateTime": "2017-02-09 00:00:05.000", "adClicks": 77736 },
          { "dateTime": "2017-02-09 00:00:06.000", "adClicks": 58507 },
          { "dateTime": "2017-02-09 00:00:07.000", "adClicks": 47163 },
          { "dateTime": "2017-02-09 00:00:08.000", "adClicks": 35183 },
          { "dateTime": "2017-02-09 00:00:09.000", "adClicks": 32758 },
          { "dateTime": "2017-02-09 00:00:10.000", "adClicks": 32024 },
          { "dateTime": "2017-02-09 00:01:00.000", "adClicks": 44904 },
          { "dateTime": "2017-02-09 00:01:01.000", "adClicks": 62029 },
          { "dateTime": "2017-02-09 00:01:02.000", "adClicks": 95170 },
          { "dateTime": "2017-02-09 00:01:03.000", "adClicks": 135196 },
          { "dateTime": "2017-02-09 00:01:04.000", "adClicks": 163283 },
          { "dateTime": "2017-02-09 00:01:05.000", "adClicks": 158796 },
          { "dateTime": "2017-02-09 00:01:06.000", "adClicks": 166673 },
          { "dateTime": "2017-02-09 00:01:07.000", "adClicks": 186524 },
          { "dateTime": "2017-02-09 00:01:08.000", "adClicks": 164860 },
          { "dateTime": "2017-02-09 00:01:09.000", "adClicks": 167813 },
          { "dateTime": "2017-02-09 00:01:10.000", "adClicks": 184985 },
          { "dateTime": "2017-02-09 00:02:00.000", "adClicks": 196688 },
          { "dateTime": "2017-02-09 00:02:01.000", "adClicks": 176962 },
          { "dateTime": "2017-02-09 00:02:02.000", "adClicks": 151662 },
          { "dateTime": "2017-02-09 00:02:03.000", "adClicks": 156158 },
          { "dateTime": "2017-02-09 00:02:04.000", "adClicks": 141660 },
          { "dateTime": "2017-02-09 00:02:05.000", "adClicks": 130757 },
          { "dateTime": "2017-02-09 00:02:06.000", "adClicks": 115753 },
          { "dateTime": "2017-02-09 00:02:07.000", "adClicks": 93722 },
          { "dateTime": "2017-02-09 00:02:08.000", "adClicks": 61043 },
          { "dateTime": "2017-02-09 00:02:09.000", "adClicks": 42930 },
          { "dateTime": "2017-02-09 00:02:10.000", "adClicks": 38197 }
        ]
      }
    }
  ]),

  secondByMinuteTimeOptions: {
    axis: {
      y: {
        series: {
          type: 'dateTime',
          config: {
            metric: { metric: 'adClicks', parameters: {}, canonicalName: 'adClicks', toJSON() { return this; } },
            timeGrain: 'minute'
          }
        }
      }
    }
  },

  anomalousDataModel: Ember.A([
    {
      request: {
        metrics: [
          {
            metric: 'uniqueIdentifier',
            canonicalName: 'uniqueIdentifier',
            toJSON() { return this; }
          }
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
  ]),

  amomalousOptions: {
    axis: {
      y: {
        series: {
          type: 'metric',
          config: {
            metrics: [{ metric: 'uniqueIdentifier', parameters: {}, canonicalName: 'uniqueIdentifier', toJSON() { return this; } }]
          }
        }
      }
    }
  },

  actions: {
    onUpdateConfig(configUpdates) {
      let config = get(this,'dimensionOptions');
      set(this, 'dimensionOptions',
        merge({}, config, configUpdates)
      );
    }
  }
});
