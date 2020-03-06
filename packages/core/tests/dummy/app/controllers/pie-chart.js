import { A } from '@ember/array';
import Controller from '@ember/controller';
import { set, get, computed, action } from '@ember/object';
import { merge } from 'lodash-es';

export default class PieChartController extends Controller {
  request = {
    dimensions: [
      {
        dimension: {
          name: 'age',
          longName: 'Age'
        }
      }
    ],
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
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      },
      {
        metric: {
          name: 'revenue',
          longName: 'Revenue'
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      }
    ]
  };

  @computed('model')
  get response() {
    return get(this, 'model.0.response.rows');
  }

  //options passed through to the pie-chart component
  options = {
    series: {
      type: 'dimension',
      config: {
        metric: {
          metric: 'totalPageViews'
        },
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: { age: '-3' }
          },
          {
            name: 'under 13',
            values: { age: '1' }
          },
          {
            name: '13 - 25',
            values: { age: '2' }
          },
          {
            name: '25 - 35',
            values: { age: '3' }
          },
          {
            name: '35 - 45',
            values: { age: '4' }
          }
        ]
      }
    }
  };

  @computed('options')
  get visualizationOptions() {
    return {
      type: 'pie-chart',
      version: 1,
      metadata: get(this, 'options')
    };
  }

  multiDimensionModel = A([
    {
      request: {
        metrics: ['uniqueIdentifier', 'totalPageViews', 'revenue'],
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2015-12-14 00:00:00.000',
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
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '-3',
            'age|desc': 'All Other',
            'browser|id': 'firefox',
            'browser|desc': 'Mozilla Firefox',
            uniqueIdentifier: 72620639,
            totalPageViews: 3072620639,
            revenue: 23435193.77284
          },
          {
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '1',
            'age|desc': 'under 13',
            'browser|id': 'Chrome',
            'browser|desc': 'Google Chrome',
            uniqueIdentifier: 55191081,
            totalPageViews: 155191081,
            revenue: 12498623.29348
          },
          {
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '2',
            'age|desc': '13 - 25',
            'browser|id': 'IE',
            'browser|desc': 'Microsoft Internet Explorer',
            uniqueIdentifier: 55191081,
            totalPageViews: 3072620639,
            revenue: 77348273.24588
          },
          {
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '3',
            'age|desc': '25 - 35',
            'browser|id': 'firefox',
            'browser|desc': 'Mozilla Firefox',
            uniqueIdentifier: 72620639,
            totalPageViews: 72620639,
            revenue: 98350255.98241
          },
          {
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '4',
            'age|desc': '35 - 45',
            'browser|id': 'Chrome',
            'browser|desc': 'Google Chrome',
            uniqueIdentifier: 72620639,
            totalPageViews: 72620639,
            revenue: 63491243.7692
          },
          {
            dateTime: '2015-12-14 00:00:00.000',
            'age|id': '4',
            'age|desc': '35 - 45',
            'browser|id': 'firefox',
            'browser|desc': 'Mozilla Firefox',
            uniqueIdentifier: 72620639,
            totalPageViews: 72620639,
            revenue: 35353239.99923
          }
        ]
      }
    }
  ]);

  multiDimensionRequest = {
    metrics: [
      {
        metric: {
          name: 'totalPageViews',
          longName: 'Total Page Views'
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      },
      {
        metric: {
          name: 'revenue',
          longName: 'Revenue'
        },
        toJSON() {
          return { metric: this.metric.name, parameters: {} };
        }
      }
    ],
    logicalTable: {
      timeGrain: 'day'
    },
    intervals: [
      {
        start: '2015-12-14 00:00:00.000',
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
  };

  @computed('multiDimensionModel')
  get multiDimensionResponse() {
    return this.get('multiDimensionModel.0.response.rows');
  }

  multiDimensionOptions = {
    series: {
      type: 'dimension',
      config: {
        metric: {
          metric: 'totalPageViews'
        },
        dimensionOrder: ['age', 'browser'],
        dimensions: [
          {
            name: 'All Other,Mozilla Firefox',
            values: { age: '-3', browser: 'firefox' }
          },
          {
            name: 'under 13,Google Chrome',
            values: { age: '1', browser: 'Chrome' }
          },
          {
            name: '13 - 25,Microsoft Internet Explorer',
            values: { age: '2', browser: 'IE' }
          },
          {
            name: '25 - 35,Mozilla Firefox',
            values: { age: '3', browser: 'firefox' }
          },
          {
            name: '35 - 45,Google Chrome',
            values: { age: '4', browser: 'Chrome' }
          },
          {
            name: '35 - 45,Mozilla Firefox',
            values: { age: '4', browser: 'firefox' }
          }
        ]
      }
    }
  };

  @computed('multiDimensionOptions')
  get visualizationOptionsMultiDimension() {
    return {
      type: 'pie-chart',
      version: 1,
      metadata: get(this, 'multiDimensionOptions')
    };
  }

  @action
  onUpdateConfigOneDimension(configUpdates) {
    const { options } = this;
    set(this, 'options', merge({}, options, configUpdates));
  }

  @action
  onUpdateConfigMultipleDimension(configUpdates) {
    let multiDimensionOptions = get(this, 'multiDimensionOptions');
    set(this, 'multiDimensionOptions', merge({}, multiDimensionOptions, configUpdates));
  }
}
