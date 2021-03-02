import { A } from '@ember/array';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { set, computed, action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { merge } from 'lodash-es';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import StoreService from '@ember-data/store';
import { PieChartConfig } from 'navi-core/models/pie-chart';

export default class PieChartController extends Controller {
  @service('store')
  store!: StoreService;

  @readOnly('model.firstObject.request')
  request!: RequestFragment;

  @readOnly('model.firstObject.response')
  response!: NaviFactResponse;

  //options passed through to the pie-chart component
  options = {
    series: {
      type: 'dimension',
      config: {
        metricCid: 'cid_totalPageViews',
        dimensions: [
          {
            name: 'All Other',
            values: { 'cid_age(field=desc)': 'All Other' },
          },
          {
            name: 'under 13',
            values: { 'cid_age(field=desc)': 'under 13' },
          },
          {
            name: '13 - 25',
            values: { 'cid_age(field=desc)': '13 - 25' },
          },
          {
            name: '25 - 35',
            values: { 'cid_age(field=desc)': '25 - 35' },
          },
          {
            name: '35 - 45',
            values: { 'cid_age(field=desc)': '35 - 45' },
          },
        ],
      },
    },
  };

  @computed('options')
  get visualizationOptions() {
    return {
      type: 'pie-chart',
      version: 1,
      metadata: this.options,
    };
  }

  get multiDimensionModel() {
    return A([
      {
        request: this.multiDimensionRequest,
        response: this.multiDimensionResponse,
      },
    ]);
  }

  multiDimensionRequest = this.store.createFragment('bard-request-v2/request', {
    columns: [
      {
        cid: 'cid_network.dateTime(grain=day)',
        field: 'network.dateTime',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        source: 'bardOne',
      },
      {
        cid: 'cid_uniqueIdentifier',
        field: 'uniqueIdentifier',
        parameters: {},
        type: 'metric',
        source: 'bardOne',
      },
      {
        cid: 'cid_totalPageViews',
        field: 'totalPageViews',
        parameters: {},
        type: 'metric',
        source: 'bardOne',
      },
      {
        cid: 'cid_revenue(currency=USD)',
        field: 'revenue',
        parameters: { currency: 'USD' },
        type: 'metric',
        source: 'bardOne',
      },
      {
        cid: 'cid_age(field=desc)',
        field: 'age',
        parameters: { field: 'desc' },
        type: 'dimension',
        source: 'bardOne',
      },
      {
        cid: 'cid_browser(field=desc)',
        field: 'browser',
        parameters: { field: 'desc' },
        type: 'dimension',
        source: 'bardOne',
      },
    ],
    filters: [
      {
        field: 'network.dateTime',
        parameters: { grain: 'day' },
        operator: 'bet',
        type: 'timeDimension',
        values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
        source: 'bardOne',
      },
    ],
    sorts: [],
    limit: null,
    dataSource: 'bardOne',
    table: 'table',
  });

  multiDimensionResponse = NaviFactResponse.create({
    rows: [
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': 'All Other',
        'browser(field=desc)': 'Mozilla Firefox',
        uniqueIdentifier: 72620639,
        totalPageViews: 3072620639,
        'revenue(currency=USD)': 23435193.77284,
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': 'under 13',
        'browser(field=desc)': 'Google Chrome',
        uniqueIdentifier: 55191081,
        totalPageViews: 155191081,
        'revenue(currency=USD)': 12498623.29348,
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': '13 - 25',
        'browser(field=desc)': 'Microsoft Internet Explorer',
        uniqueIdentifier: 55191081,
        totalPageViews: 3072620639,
        'revenue(currency=USD)': 77348273.24588,
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': '25 - 35',
        'browser(field=desc)': 'Mozilla Firefox',
        uniqueIdentifier: 72620639,
        totalPageViews: 72620639,
        'revenue(currency=USD)': 98350255.98241,
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': '35 - 45',
        'browser(field=desc)': 'Google Chrome',
        uniqueIdentifier: 72620639,
        totalPageViews: 72620639,
        'revenue(currency=USD)': 63491243.7692,
      },
      {
        'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
        'age(field=desc)': '35 - 45',
        'browser(field=desc)': 'Mozilla Firefox',
        uniqueIdentifier: 72620639,
        totalPageViews: 72620639,
        'revenue(currency=USD)': 35353239.99923,
      },
    ],
  });

  multiDimensionOptions = {
    series: {
      type: 'dimension',
      config: {
        metricCid: 'cid_totalPageViews',
        dimensions: [
          {
            name: 'All Other,Mozilla Firefox',
            values: { 'cid_age(field=desc)': 'All Other', 'cid_browser(field=desc)': 'Mozilla Firefox' },
          },
          {
            name: 'under 13,Google Chrome',
            values: { 'cid_age(field=desc)': 'under 13', 'cid_browser(field=desc)': 'Google Chrome' },
          },
          {
            name: '13 - 25,Microsoft Internet Explorer',
            values: { 'cid_age(field=desc)': '13 - 25', 'cid_browser(field=desc)': 'Microsoft Internet Explorer' },
          },
          {
            name: '25 - 35,Mozilla Firefox',
            values: { 'cid_age(field=desc)': '25 - 35', 'cid_browser(field=desc)': 'Mozilla Firefox' },
          },
          {
            name: '35 - 45,Google Chrome',
            values: { 'cid_age(field=desc)': '35 - 45', 'cid_browser(field=desc)': 'Google Chrome' },
          },
          {
            name: '35 - 45,Mozilla Firefox',
            values: { 'cid_age(field=desc)': '35 - 45', 'cid_browser(field=desc)': 'Mozilla Firefox' },
          },
        ],
      },
    },
  };

  @computed('multiDimensionOptions')
  get visualizationOptionsMultiDimension() {
    return {
      type: 'pie-chart',
      version: 2,
      metadata: this.multiDimensionOptions,
    };
  }

  @action
  onUpdateConfigOneDimension(configUpdates: Partial<PieChartConfig['metadata']>) {
    const { options } = this;
    set(this, 'options', merge({}, options, configUpdates));
  }

  @action
  onUpdateConfigMultipleDimension(configUpdates: Partial<PieChartConfig['metadata']>) {
    const { multiDimensionOptions } = this;
    set(this, 'multiDimensionOptions', merge({}, multiDimensionOptions, configUpdates));
  }
}
