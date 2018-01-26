import Ember from 'ember';
const { get, set } = Ember;

export default Ember.Controller.extend({

  request: {
    dimensions: [{
      dimension: {
        name: 'age',
        longName: 'Age'
      }
    }],
    intervals: [
      {
        start: '2015-12-14 00:00:00.000',
        end: '2015-12-15 00:00:00.000'
      }
    ],
    metrics: [
      {
        metric: {
          name: 'totalPageViews',
          longName: 'Total Page Views'
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        }
      }
    ]
  },

  response: Ember.computed('model', function() {
    return this.get('model.0.response.rows');
  }),

  //options passed through to the pie-chart component
  options: {
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
  },

  visualizationOptions: Ember.computed('options', function() {
    return {
      type: 'pie-chart',
      version: 1,
      metadata: Ember.get(this, 'options')
    };
  }),

  multiDimensionModel: Ember.A([
    {
      request: {
        metrics: [
          "uniqueIdentifier",
          "totalPageViews"
        ],
        logicalTable: {
          timeGrain: "quarter"
        },
        intervals: [
          {
            start: '2015-12-13 00:00:00.000',
            end: '2015-12-15 00:00:00.000'
          }
        ],
        dimensions: [
          {
            dimension: 'age'
          },
          {
            dimension: 'browser'
          }
        ]
      },
      response: {
        rows: [
          {
            "dateTime": "2015-12-14 00:00:00.000",
            "age|id": "-3",
            "age|desc": "All Other",
            "browser|id": "firefox",
            "browser|desc": "Mozilla Firefox",
            "uniqueIdentifier": 72620639,
            "totalPageViews": 3072620639
          },
          {
            "dateTime": "2015-12-14 00:00:00.000",
            "age|id": "1",
            "age|desc": "under 13",
            "browser|id": "Chrome",
            "browser|desc": "Google Chrome",
            "uniqueIdentifier": 55191081,
            "totalPageViews": 155191081
          },
          {
            "dateTime": "2015-12-14 00:00:00.000",
            "age|id": "2",
            "age|desc": "13 - 25",
            "browser|id": "IE",
            "browser|desc": "Microsoft Internet Explorer",
            "uniqueIdentifier": 55191081,
            "totalPageViews": 3072620639
          },
          {
            "dateTime": "2015-12-14 00:00:00.000",
            "age|id": "3",
            "age|desc": "25 - 35",
            "browser|id": "firefox",
            "browser|desc": "Mozilla Firefox",
            "uniqueIdentifier": 72620639,
            "totalPageViews": 72620639
          },
          {
            "dateTime": "2015-12-14 00:00:00.000",
            "age|id": "4",
            "age|desc": "35 - 45",
            "browser|id": "Chrome",
            "browser|desc": "Google Chrome",
            "uniqueIdentifier": 72620639,
            "totalPageViews": 72620639
          }
        ]
      }
    }
  ]),

  multiDimensionRequest: {
    metrics: [
      {
        metric: {
          name: 'totalPageViews',
          longName: 'Total Page Views'
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        }
      }
    ],
    logicalTable: {
      timeGrain: "quarter"
    },
    intervals: [
      {
        start: '2015-12-13 00:00:00.000',
        end: '2015-12-15 00:00:00.000'
      }
    ],
    dimensions: [
      {
        dimension: {
          name: 'age',
          longName: 'Age'
        }
      },
      {
        dimension: {
          name: 'browser',
          longName: 'Browser'
        }
      }
    ]
  },

  multiDimensionResponse: Ember.computed('multiDimensionModel', function() {
    return this.get('multiDimensionModel.0.response.rows');
  }),

  multiDimensionOptions: {
    series: {
      type: 'dimension',
      config: {
        metric: 'totalPageViews',
        dimensionOrder: ['age', 'browser'],
        dimensions: [
          {
            name: 'All Other,Mozilla Firefox',
            values: {age: '-3', browser: 'firefox'}
          },
          {
            name: 'under 13,Google Chrome',
            values: {age: '1', browser: 'Chrome'}
          },
          {
            name: '13 - 25,Microsoft Internet Explorer',
            values: {age: '2', browser: 'IE'}
          },
          {
            name: '25 - 35,Mozilla Firefox',
            values: {age: '3', browser: 'firefox'}
          },
          {
            name: '35 - 45,Google Chrome',
            values: {age: '4', browser: 'Chrome'}
          },
          {
            name: '35 - 45,Mozilla Firefox',
            values: {age: '4', browser: 'firefox'}
          }
        ]
      }
    }
  },

  visualizationOptionsMultiDimension: Ember.computed('options', function() {
    return {
      type: 'pie-chart',
      version: 1,
      metadata: Ember.get(this, 'multiDimensionOptions')
    };
  }),

  actions: {
    onUpdateConfigOneDimension(configUpdates) {
      let options = get(this,'options');
      set(this, 'options',
        Ember.$.extend(true, {}, options, configUpdates)
      );
    },
    onUpdateConfigMultipleDimension(configUpdates) {
      let multiDimensionOptions = get(this,'multiDimensionOptions');
      set(this, 'multiDimensionOptions',
        Ember.$.extend(true, {}, multiDimensionOptions, configUpdates)
      );
    }
  }
});
