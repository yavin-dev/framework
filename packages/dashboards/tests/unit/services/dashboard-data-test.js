import { cloneDeep, merge } from 'lodash-es';
import { resolve } from 'rsvp';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import config from 'ember-get-config';
import { timeout } from 'ember-concurrency';
import { run, later } from '@ember/runloop';

let MetadataService, Store;

module('Unit | Service | dashboard data', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:bard-metadata');
    Store = this.owner.lookup('service:store');
    await MetadataService.loadMetadata();
  });

  test('fetch data for dashboard', async function(assert) {
    assert.expect(3);

    const mockDashboard = {
      id: 1,
      widgets: resolve([1, 2, 3]),
      presentation: { layout: 'fooLayout' }
    };

    const service = this.owner.factoryFor('service:dashboard-data').create({
      // Skip the ws data fetch for this test
      fetchDataForWidgets: (id, widgets, layout, decorators, options) => {
        //removing custom headers
        delete options.customHeaders;
        assert.deepEqual(
          options,
          { page: 1, perPage: 10000 },
          'Default pagination options are passed through to fetchDataForWidgets'
        );

        assert.equal(layout, 'fooLayout', 'Layout is passed through to fetchDataForWidgets');

        return widgets;
      }
    });

    const dataForWidget = await service.fetchDataForDashboard(mockDashboard);
    assert.deepEqual(
      dataForWidget,
      [1, 2, 3],
      '`fetchDataForDashboard` resolves to return value of `fetchDataForWidgets`'
    );
  });

  test('fetch data for widget', async function(assert) {
    assert.expect(10);

    let fetchCalls = [];

    const service = this.owner.factoryFor('service:dashboard-data').create({
      _fetch(request) {
        // Skip the ws data fetch for this test
        fetchCalls.push(request.data);
        return resolve({
          request,
          response: { data: request.data }
        });
      }
    });

    let data = service.fetchDataForWidgets(1);
    assert.deepEqual(data, {}, 'no widgets returns empty object and null');

    const makeRequest = (data, filters = []) => ({
      clone() {
        return cloneDeep(this);
      },
      serialize() {
        return cloneDeep(this);
      },
      addFilter(filter) {
        this.filters.push(filter);
      },
      logicalTable: {
        table: { name: 'table1' },
        timeGrain: { dimensionIds: [] }
      },
      data,
      filters
    });

    const dashboard = {
      filters: []
    };

    let widgets = [
        { id: 1, dashboard: cloneDeep(dashboard), requests: [makeRequest(1), makeRequest(2), makeRequest(3)] },
        { id: 2, dashboard: cloneDeep(dashboard), requests: [makeRequest(4)] },
        { id: 3, dashboard: cloneDeep(dashboard), requests: [] }
      ],
      layout = [
        { widgetId: 1, row: 4, column: 0 },
        { widgetId: 2, row: 0, column: 0 },
        { widgetId: 3, row: 4, column: 4 }
      ];

    data = service.fetchDataForWidgets(1, widgets, layout);

    assert.deepEqual(Object.keys(data), ['1', '2', '3'], 'data is keyed by widget id');

    assert.ok(get(data, '1.isRunning'), 'data returns a task instance per widget');

    const widgetData = await get(data, '1');
    assert.deepEqual(
      widgetData.map(res => get(res, 'response.data')),
      [1, 2, 3],
      'data for widget is an array of request responses'
    );

    await get(data, '2');
    await get(data, '3');

    assert.deepEqual(fetchCalls, [4, 1, 2, 3], 'requests are enqueued by layout order');

    /* == Decorators == */
    data = service.fetchDataForWidgets(1, widgets, layout, [obj => merge({}, obj, { data: obj.data + 1 })]);

    const decoratorWidgetData = await get(data, '1');
    assert.deepEqual(
      decoratorWidgetData.map(obj => get(obj, 'response.data')),
      [2, 3, 4],
      'each response is modified by the decorators'
    );

    /* == Options == */
    let optionsObject = {
      page: 1
    };

    service.set('_fetch', (request, options) => {
      assert.equal(options, optionsObject, 'options object is passed on to data fetch method');

      let uiViewHeaderElems = options.customHeaders.uiView.split('.');

      assert.equal(uiViewHeaderElems[1], 1, 'uiView header has the dashboard id');

      assert.equal(uiViewHeaderElems[3], 2, 'uiView header has the widget id');

      assert.ok(uiViewHeaderElems[2], 'uiView header has a random uuid attached to the end');

      return resolve({});
    });

    service.fetchDataForWidgets(
      1,
      [{ id: 2, dashboard: cloneDeep(dashboard), requests: [makeRequest(4)] }],
      [{ widgetId: 2 }],
      [],
      optionsObject
    );
  });

  test('fetch concurrency and restart', async function(assert) {
    assert.expect(3);

    const done = assert.async();

    const fetchCalls = [];

    const service = this.owner.factoryFor('service:dashboard-data').create({
      async _fetch(request) {
        fetchCalls.push(request.data);
        await timeout(100);

        // cancel all widget tasks
        run(() => {
          service._fetchRequestsForWidget.cancelAll();
        });

        later(() =>
          resolve({
            request,
            response: { data: request.data }
          })
        );
      }
    });

    const makeRequest = (data, filters = []) => ({
      clone() {
        return cloneDeep(this);
      },
      serialize() {
        return cloneDeep(this);
      },
      addFilter(filter) {
        this.filters.push(filter);
      },
      logicalTable: {
        table: { name: 'table1' },
        timeGrain: { dimensionIds: [] }
      },
      data,
      filters
    });

    const dashboard = {
      filters: []
    };

    const widgets = [
        { id: 1, dashboard: cloneDeep(dashboard), requests: [makeRequest(1), makeRequest(2), makeRequest(3)] },
        { id: 2, dashboard: cloneDeep(dashboard), requests: [makeRequest(4), makeRequest(5), makeRequest(6)] }
      ],
      layout = [{ widgetId: 1, row: 0, column: 0 }, { widgetId: 2, row: 4, column: 0 }];

    try {
      const data = service.fetchDataForWidgets(1, widgets, layout);
      assert.equal(service._fetchRequestsForWidget.concurrency, 2, 'fetch task concurrency is correctly set by config');
      await get(data, '1');
    } catch (e) {
      assert.deepEqual(
        fetchCalls,
        [1, 2],
        '2 first concurrent fetch tasks were running, others were cancelled by restart of parent'
      );
      assert.equal(service._fetchRequestsForWidget.concurrency, 0, 'no more tasks are running');
    } finally {
      done();
    }
  });

  test('_fetch', function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:dashboard-data'),
      request = {
        logicalTable: {
          table: 'network',
          timeGrain: 'day'
        },
        metrics: [{ metric: 'adClicks' }],
        dimensions: [],
        filters: [],
        intervals: [
          {
            end: 'current',
            start: 'P7D'
          }
        ],
        bardVersion: 'v1',
        requestVersion: 'v1'
      },
      response = {
        rows: [
          {
            adClicks: 30
          },
          {
            adClicks: 1000
          },
          {
            adClicks: 200
          }
        ]
      };

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('data/network/day/', () => {
      return response;
    });

    return service._fetch(request).then(fetchResponse => {
      assert.deepEqual(fetchResponse.get('response.rows'), response.rows, 'fetch gets response from web service');
    });
  });

  test('_decorate', function(assert) {
    assert.expect(2);

    let service = this.owner.lookup('service:dashboard-data'),
      add = number => number + 5,
      subtract = number => number - 3;

    assert.equal(
      service._decorate([add, subtract], 1),
      3,
      'decorate calls each decorator function and passes the result to the next decorator'
    );

    assert.equal(service._decorate([], 1), 1, 'empty array of decorators has no effect');
  });

  test('global filter application and error injection.', async function(assert) {
    assert.expect(4);

    const DIMENSIONS = ['os', 'age', 'gender', 'platform', 'property', 'browser', 'userCountry', 'screenType'];
    const VALID_FILTERS = ['os', 'gender', 'platform'];
    const DASHBOARD_FILTERS = ['os', 'age', 'platform'];
    const NO_VALUE_FILTERS = ['platform'];

    const service = this.owner.factoryFor('service:dashboard-data').create({
      _fetch(request) {
        // Skip the ws data fetch for this test
        return resolve({
          request,
          response: {
            meta: {
              errors: [{ title: 'Server Error' }]
            }
          }
        });
      }
    });

    const makeFilter = ({ dimension }) => {
      const rawValues = NO_VALUE_FILTERS.includes(dimension) ? [] : ['1'];
      const dimensionFragment = MetadataService.getById('dimension', dimension);

      return Store.createFragment('bard-request/fragments/filter', {
        dimension: dimensionFragment,
        field: 'id',
        operator: 'in',
        rawValues
      });
    };

    const dashboard = {
      filters: DASHBOARD_FILTERS.map(dimension => makeFilter({ dimension }))
    };

    const makeRequest = (data, filters) => ({
      clone() {
        return cloneDeep(this);
      },
      serialize() {
        return cloneDeep(this);
      },
      addRawFilter(filter) {
        this.filters.push(filter);
      },
      logicalTable: {
        table: { name: 'table1' },
        timeGrain: { dimensionIds: VALID_FILTERS }
      },
      data,
      filters: filters || [makeFilter({ dimension: `${DIMENSIONS[data + 4]}` })]
    });

    const widgets = [
      {
        dashboard: cloneDeep(dashboard),
        id: 1,
        requests: [makeRequest(0), makeRequest(1, []), makeRequest(2)]
      },
      {
        dashboard: cloneDeep(dashboard),
        id: 2,
        requests: [makeRequest(3)]
      },
      {
        dashboard: cloneDeep(dashboard),
        id: 3,
        requests: []
      }
    ];

    const layout = [{ widgetId: 1 }, { widgetId: 2 }, { widgetId: 3 }];

    const data = service.fetchDataForWidgets(1, widgets, layout);

    const widget1 = await get(data, '1');
    const widget2 = await get(data, '2');
    const widget3 = await get(data, '3');

    assert.deepEqual(
      widget1.map(result => get(result, 'request.filters').map(filter => get(filter, 'dimension.name'))),
      [['property', 'os'], ['os'], ['userCountry', 'os']],
      'Applicable global filters are applied to widget 1 requests'
    );

    assert.deepEqual(
      widget2.map(result => get(result, 'request.filters').map(filter => get(filter, 'dimension.name'))),
      [['screenType', 'os']],
      'Applicable global filters are applied to widget 2 requests'
    );

    assert.deepEqual(
      widget3.map(result => get(result, 'request.filters').map(filter => get(filter, 'dimension.name'))),
      [],
      'Applicable global filters are applied to widget 3 requests'
    );

    assert.deepEqual(
      widget1.map(result => get(result, 'response.meta.errors')),
      [
        [
          {
            title: 'Server Error'
          },
          {
            detail: '"age" is not a dimension in the "table1" table.',
            title: 'Invalid Filter'
          }
        ],
        [
          {
            title: 'Server Error'
          },
          {
            detail: '"age" is not a dimension in the "table1" table.',
            title: 'Invalid Filter'
          }
        ],
        [
          {
            title: 'Server Error'
          },
          {
            detail: '"age" is not a dimension in the "table1" table.',
            title: 'Invalid Filter'
          }
        ]
      ],
      'Errors are injected into the response.'
    );
  });
});
