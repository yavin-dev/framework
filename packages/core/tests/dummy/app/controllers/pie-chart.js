import { A } from '@ember/array';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, get, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { merge } from 'lodash-es';

export default class PieChartController extends Controller {
  @service('store')
  store;

  @readOnly('model.firstObject.request')
  request;

  @readOnly('model.firstObject.response.rows')
  response;

  //options passed through to the pie-chart component
  options = {
    series: {
      type: 'dimension',
      config: {
        metricCid: '3',
        dimensionOrder: ['5'],
        dimensions: [
          {
            name: 'All Other',
            values: { '5': 'All Other' }
          },
          {
            name: 'under 13',
            values: { '5': 'under 13' }
          },
          {
            name: '13 - 25',
            values: { '5': '13 - 25' }
          },
          {
            name: '25 - 35',
            values: { '5': '25 - 35' }
          },
          {
            name: '35 - 45',
            values: { '5': '35 - 45' }
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
      metadata: this.options
    };
  }

  get multiDimensionModel() {
    return A([
      {
        request: this.multiDimensionRequest,
        response: {
          rows: this.multiDimensionResponse
        }
      }
    ]);
  }

  multiDimensionRequest = this.store.createFragment('bard-request-v2/request', {
    columns: [
      {
        cid: '1',
        field: 'time',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        source: 'source'
      },
      {
        cid: '2',
        field: 'uniqueIdentifier',
        parameters: {},
        type: 'metric',
        source: 'source'
      },
      {
        cid: '3',
        field: 'totalPageViews',
        parameters: {},
        type: 'metric',
        source: 'source'
      },
      {
        cid: '4',
        field: 'revenue',
        parameters: {},
        type: 'metric',
        source: 'source'
      },
      {
        cid: '5',
        field: 'age',
        parameters: { field: 'desc' },
        type: 'dimension',
        source: 'source'
      },
      {
        cid: '6',
        field: 'browser',
        parameters: { field: 'desc' },
        type: 'dimension',
        source: 'source'
      }
    ],
    filters: [
      {
        field: 'time',
        parameters: { grain: 'day' },
        operator: 'bet',
        type: 'timeDimension',
        values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
        source: 'source'
      }
    ],
    sorts: [],
    limit: null,
    dataSource: 'source',
    table: 'table'
  });

  multiDimensionResponse = [
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '-3',
      'age(field=desc)': 'All Other',
      // 'browser|id': 'firefox',
      'browser(field=desc)': 'Mozilla Firefox',
      uniqueIdentifier: 72620639,
      totalPageViews: 3072620639,
      revenue: 23435193.77284
    },
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '1',
      'age(field=desc)': 'under 13',
      // 'browser|id': 'Chrome',
      'browser(field=desc)': 'Google Chrome',
      uniqueIdentifier: 55191081,
      totalPageViews: 155191081,
      revenue: 12498623.29348
    },
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '2',
      'age(field=desc)': '13 - 25',
      // 'browser|id': 'IE',
      'browser(field=desc)': 'Microsoft Internet Explorer',
      uniqueIdentifier: 55191081,
      totalPageViews: 3072620639,
      revenue: 77348273.24588
    },
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '3',
      'age(field=desc)': '25 - 35',
      // 'browser|id': 'firefox',
      'browser(field=desc)': 'Mozilla Firefox',
      uniqueIdentifier: 72620639,
      totalPageViews: 72620639,
      revenue: 98350255.98241
    },
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '4',
      'age(field=desc)': '35 - 45',
      // 'browser|id': 'Chrome',
      'browser(field=desc)': 'Google Chrome',
      uniqueIdentifier: 72620639,
      totalPageViews: 72620639,
      revenue: 63491243.7692
    },
    {
      'time(grain=day)': '2015-12-14 00:00:00.000',
      // 'age|id': '4',
      'age(field=desc)': '35 - 45',
      // 'browser|id': 'firefox',
      'browser(field=desc)': 'Mozilla Firefox',
      uniqueIdentifier: 72620639,
      totalPageViews: 72620639,
      revenue: 35353239.99923
    }
  ];

  multiDimensionOptions = {
    series: {
      type: 'dimension',
      config: {
        metricCid: '3',
        dimensionOrder: ['5', '6'],
        dimensions: [
          {
            name: 'All Other,Mozilla Firefox',
            values: { '5': 'All Other', '6': 'Mozilla Firefox' }
          },
          {
            name: 'under 13,Google Chrome',
            values: { '5': 'under 13', '6': 'Google Chrome' }
          },
          {
            name: '13 - 25,Microsoft Internet Explorer',
            values: { '5': '13 - 25', '6': 'Microsoft Internet Explorer' }
          },
          {
            name: '25 - 35,Mozilla Firefox',
            values: { '5': '25 - 35', '6': 'Mozilla Firefox' }
          },
          {
            name: '35 - 45,Google Chrome',
            values: { '5': '35 - 45', '6': 'Google Chrome' }
          },
          {
            name: '35 - 45,Mozilla Firefox',
            values: { '5': '35 - 45', '6': 'Mozilla Firefox' }
          }
        ]
      }
    }
  };

  @computed('multiDimensionOptions')
  get visualizationOptionsMultiDimension() {
    return {
      type: 'pie-chart',
      version: 2,
      metadata: this.multiDimensionOptions
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
