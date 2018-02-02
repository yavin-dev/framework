import Ember from 'ember';

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
        metric: {
          name: 'clicks',
          longName: 'Clicks'
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        }
      },
      {
        metric: {
          name: 'revenue',
          longName: 'Revenue'
        }
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
            metrics: ['uniqueIdentifier', 'totalPageViews', 'revenue']
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
            metric: 'clicks',
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
            metric: 'totalPageViews',
            timeGrain: 'year'
          }
        }
      }
    }
  },

  dimensionModel: Ember.A([
    {
      request: {
        metrics: [
          "clicks",
          "uniqueIdentifier",
          "revenue"
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
          { "dateTime": "2017-02-09 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 112619, "revenue": 93234.32304, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 102039, "revenue": 67234.12663, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 99890, "revenue": 12498.12298, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 95337, "revenue": 43992.98540, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 58507, "revenue": 78332.98822, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 47163, "revenue": 101242.53242, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 35183, "revenue": 120249.93840, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 32758, "revenue": 115234.33482, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-18 00:00:00.000", "age|id": "-3", "age|desc": "All Other", "clicks": 32024, "revenue": 98123.34991, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 62029, "revenue": 89129.75744, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 95170, "revenue": 77234.99801, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 135196, "revenue": 93221.12390, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 158796, "revenue": 105882.99283, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 166673, "revenue": 100000.12312, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 186524, "revenue": 96234.09383, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 164860, "revenue": 140243.77293, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-18 00:00:00.000", "age|id": "4", "age|desc": "21-24", "clicks": 167813, "revenue": 147992.84392, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-09 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 184985, "revenue": 149234.88192, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-10 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 196688, "revenue": 156234.88239, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-11 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 176962, "revenue": 150532.81759, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-12 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 151662, "revenue": 135998.37414, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-14 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 141660, "revenue": 129352.99810, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-15 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 130757, "revenue": 120342.84859, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-16 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 115753, "revenue": 99157.66384, 'uniqueIdentifier': 100 },
          { "dateTime": "2017-02-17 00:00:00.000", "age|id": "5", "age|desc": "25-29", "clicks": 93722, "revenue": 80500.77383, 'uniqueIdentifier': 100 }
        ]
      }
    }
  ]),

  hourGrainModel: Ember.A([
    {
      request: {
        metrics: [
          "clicks"
        ],
        logicalTable: {
          timeGrain: "hour"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "clicks": 112619 },
          { "dateTime": "2017-02-09 01:00:00.000", "clicks": 102039 },
          { "dateTime": "2017-02-09 02:00:00.000", "clicks": 99890 },
          { "dateTime": "2017-02-09 03:00:00.000", "clicks": 95337 },
          { "dateTime": "2017-02-09 04:00:00.000", "clicks": 77736 },
          { "dateTime": "2017-02-09 05:00:00.000", "clicks": 58507 },
          { "dateTime": "2017-02-09 06:00:00.000", "clicks": 47163 },
          { "dateTime": "2017-02-09 07:00:00.000", "clicks": 35183 },
          { "dateTime": "2017-02-09 08:00:00.000", "clicks": 32758 },
          { "dateTime": "2017-02-09 09:00:00.000", "clicks": 32024 },
          { "dateTime": "2017-02-09 10:00:00.000", "clicks": 44904 },
          { "dateTime": "2017-02-09 11:00:00.000", "clicks": 62029 },
          { "dateTime": "2017-02-09 12:00:00.000", "clicks": 95170 },
          { "dateTime": "2017-02-09 13:00:00.000", "clicks": 135196 },
          { "dateTime": "2017-02-09 14:00:00.000", "clicks": 163283 },
          { "dateTime": "2017-02-09 15:00:00.000", "clicks": 158796 },
          { "dateTime": "2017-02-09 16:00:00.000", "clicks": 166673 },
          { "dateTime": "2017-02-09 17:00:00.000", "clicks": 186524 },
          { "dateTime": "2017-02-09 18:00:00.000", "clicks": 164860 },
          { "dateTime": "2017-02-09 19:00:00.000", "clicks": 167813 },
          { "dateTime": "2017-02-09 20:00:00.000", "clicks": 184985 },
          { "dateTime": "2017-02-09 21:00:00.000", "clicks": 196688 },
          { "dateTime": "2017-02-09 22:00:00.000", "clicks": 176962 },
          { "dateTime": "2017-02-09 23:00:00.000", "clicks": 151662 },
          { "dateTime": "2017-02-10 00:00:00.000", "clicks": 156158 },
          { "dateTime": "2017-02-10 01:00:00.000", "clicks": 141660 },
          { "dateTime": "2017-02-10 02:00:00.000", "clicks": 130757 },
          { "dateTime": "2017-02-10 03:00:00.000", "clicks": 115753 },
          { "dateTime": "2017-02-10 04:00:00.000", "clicks": 93722 },
          { "dateTime": "2017-02-10 05:00:00.000", "clicks": 61043 },
          { "dateTime": "2017-02-10 06:00:00.000", "clicks": 42930 },
          { "dateTime": "2017-02-10 07:00:00.000", "clicks": 38197 },
          { "dateTime": "2017-02-10 08:00:00.000", "clicks": 35524 },
          { "dateTime": "2017-02-10 09:00:00.000", "clicks": 33151 },
          { "dateTime": "2017-02-10 10:00:00.000", "clicks": 41540 },
          { "dateTime": "2017-02-10 11:00:00.000", "clicks": 67897 },
          { "dateTime": "2017-02-10 12:00:00.000", "clicks": 102692 },
          { "dateTime": "2017-02-10 13:00:00.000", "clicks": 148882 },
          { "dateTime": "2017-02-10 14:00:00.000", "clicks": 178171 },
          { "dateTime": "2017-02-10 15:00:00.000", "clicks": 195863 },
          { "dateTime": "2017-02-10 16:00:00.000", "clicks": 189377 },
          { "dateTime": "2017-02-10 17:00:00.000", "clicks": 210462 },
          { "dateTime": "2017-02-10 18:00:00.000", "clicks": 204357 },
          { "dateTime": "2017-02-10 19:00:00.000", "clicks": 195042 },
          { "dateTime": "2017-02-10 20:00:00.000", "clicks": 201723 },
          { "dateTime": "2017-02-10 21:00:00.000", "clicks": 190928 },
          { "dateTime": "2017-02-10 22:00:00.000", "clicks": 156252 },
          { "dateTime": "2017-02-10 23:00:00.000", "clicks": 132054 }
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
            metric: 'clicks',
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
          "clicks"
        ],
        logicalTable: {
          timeGrain: "minute"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "clicks": 112619 },
          { "dateTime": "2017-02-09 00:01:00.000", "clicks": 44904 },
          { "dateTime": "2017-02-09 00:02:00.000", "clicks": 102039 },
          { "dateTime": "2017-02-09 00:03:00.000", "clicks": 99890 },
          { "dateTime": "2017-02-09 00:04:00.000", "clicks": 95337 },
          { "dateTime": "2017-02-09 00:05:00.000", "clicks": 77736 },
          { "dateTime": "2017-02-09 00:06:00.000", "clicks": 58507 },
          { "dateTime": "2017-02-09 00:07:00.000", "clicks": 47163 },
          { "dateTime": "2017-02-09 00:08:00.000", "clicks": 35183 },
          { "dateTime": "2017-02-09 00:09:00.000", "clicks": 32758 },
          { "dateTime": "2017-02-09 00:10:00.000", "clicks": 32024 },
          { "dateTime": "2017-02-09 01:00:00.000", "clicks": 44904 },
          { "dateTime": "2017-02-09 01:01:00.000", "clicks": 62029 },
          { "dateTime": "2017-02-09 01:02:00.000", "clicks": 95170 },
          { "dateTime": "2017-02-09 01:03:00.000", "clicks": 135196 },
          { "dateTime": "2017-02-09 01:04:00.000", "clicks": 163283 },
          { "dateTime": "2017-02-09 01:05:00.000", "clicks": 158796 },
          { "dateTime": "2017-02-09 01:06:00.000", "clicks": 166673 },
          { "dateTime": "2017-02-09 01:07:00.000", "clicks": 186524 },
          { "dateTime": "2017-02-09 01:08:00.000", "clicks": 164860 },
          { "dateTime": "2017-02-09 01:09:00.000", "clicks": 167813 },
          { "dateTime": "2017-02-09 01:10:00.000", "clicks": 184985 },
          { "dateTime": "2017-02-09 02:00:00.000", "clicks": 196688 },
          { "dateTime": "2017-02-09 02:01:00.000", "clicks": 176962 },
          { "dateTime": "2017-02-09 02:02:00.000", "clicks": 151662 },
          { "dateTime": "2017-02-09 02:03:00.000", "clicks": 156158 },
          { "dateTime": "2017-02-09 02:04:00.000", "clicks": 141660 },
          { "dateTime": "2017-02-09 02:05:00.000", "clicks": 130757 },
          { "dateTime": "2017-02-09 02:06:00.000", "clicks": 115753 },
          { "dateTime": "2017-02-09 02:07:00.000", "clicks": 93722 },
          { "dateTime": "2017-02-09 02:08:00.000", "clicks": 61043 },
          { "dateTime": "2017-02-09 02:09:00.000", "clicks": 42930 },
          { "dateTime": "2017-02-09 02:10:00.000", "clicks": 38197 }
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
            metric: 'clicks',
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
          "clicks"
        ],
        logicalTable: {
          timeGrain: "second"
        }
      },
      response: {
        "rows": [
          { "dateTime": "2017-02-09 00:00:00.000", "clicks": 112619 },
          { "dateTime": "2017-02-09 00:00:01.000", "clicks": 99890 },
          { "dateTime": "2017-02-09 00:00:02.000", "clicks": 102039 },
          { "dateTime": "2017-02-09 00:00:03.000", "clicks": 99890 },
          { "dateTime": "2017-02-09 00:00:04.000", "clicks": 95337 },
          { "dateTime": "2017-02-09 00:00:05.000", "clicks": 77736 },
          { "dateTime": "2017-02-09 00:00:06.000", "clicks": 58507 },
          { "dateTime": "2017-02-09 00:00:07.000", "clicks": 47163 },
          { "dateTime": "2017-02-09 00:00:08.000", "clicks": 35183 },
          { "dateTime": "2017-02-09 00:00:09.000", "clicks": 32758 },
          { "dateTime": "2017-02-09 00:00:10.000", "clicks": 32024 },
          { "dateTime": "2017-02-09 00:01:00.000", "clicks": 44904 },
          { "dateTime": "2017-02-09 00:01:01.000", "clicks": 62029 },
          { "dateTime": "2017-02-09 00:01:02.000", "clicks": 95170 },
          { "dateTime": "2017-02-09 00:01:03.000", "clicks": 135196 },
          { "dateTime": "2017-02-09 00:01:04.000", "clicks": 163283 },
          { "dateTime": "2017-02-09 00:01:05.000", "clicks": 158796 },
          { "dateTime": "2017-02-09 00:01:06.000", "clicks": 166673 },
          { "dateTime": "2017-02-09 00:01:07.000", "clicks": 186524 },
          { "dateTime": "2017-02-09 00:01:08.000", "clicks": 164860 },
          { "dateTime": "2017-02-09 00:01:09.000", "clicks": 167813 },
          { "dateTime": "2017-02-09 00:01:10.000", "clicks": 184985 },
          { "dateTime": "2017-02-09 00:02:00.000", "clicks": 196688 },
          { "dateTime": "2017-02-09 00:02:01.000", "clicks": 176962 },
          { "dateTime": "2017-02-09 00:02:02.000", "clicks": 151662 },
          { "dateTime": "2017-02-09 00:02:03.000", "clicks": 156158 },
          { "dateTime": "2017-02-09 00:02:04.000", "clicks": 141660 },
          { "dateTime": "2017-02-09 00:02:05.000", "clicks": 130757 },
          { "dateTime": "2017-02-09 00:02:06.000", "clicks": 115753 },
          { "dateTime": "2017-02-09 00:02:07.000", "clicks": 93722 },
          { "dateTime": "2017-02-09 00:02:08.000", "clicks": 61043 },
          { "dateTime": "2017-02-09 00:02:09.000", "clicks": 42930 },
          { "dateTime": "2017-02-09 00:02:10.000", "clicks": 38197 }
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
            metric: 'clicks',
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
  ]),

  amomalousOptions: {
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
  },

  actions: {
    onUpdateConfig(configUpdates) {
      let config = get(this,'dimensionOptions');
      set(this, 'dimensionOptions',
        Ember.$.extend(true, {}, config, configUpdates)
      );
    }
  }
});
