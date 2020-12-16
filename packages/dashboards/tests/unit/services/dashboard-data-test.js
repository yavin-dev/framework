import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { get } from '@ember/object';
import { cloneDeep, merge } from 'lodash-es';
import { resolve } from 'rsvp';
import config from 'ember-get-config';

let MetadataService, Store;

module('Unit | Service | dashboard data', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    MetadataService = this.owner.lookup('service:navi-metadata');
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
    assert.expect(11);

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
      table: 'table1',
      tableMetadata: {
        dimensionIds: []
      },
      data,
      filters,
      sorts: [],
      columns: [],
      dataSource: 'test',
      requestVersion: '2.0'
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

    assert.equal(service._fetchRequestsForWidget.concurrency, 2, 'fetch task concurrency is correctly set by config');
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

  test('_fetch', function(assert) {
    assert.expect(1);

    let service = this.owner.lookup('service:dashboard-data'),
      request = {
        table: 'network',
        filters: [
          {
            type: 'timeDimension',
            field: 'network.dateTime',
            parameters: { grain: 'day' },
            operator: 'bet',
            values: ['P7D', 'current']
          }
        ],
        sorts: [],
        columns: [
          { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' } },
          { type: 'metric', field: 'adClicks', parameters: {} }
        ],
        requestVersion: '2.0',
        dataSource: 'bardOne'
      },
      response = {
        rows: [
          {
            adClicks: 30,
            'network.dateTime(grain=day)': undefined
          },
          {
            adClicks: 1000,
            'network.dateTime(grain=day)': undefined
          },
          {
            adClicks: 200,
            'network.dateTime(grain=day)': undefined
          }
        ]
      };

    server.urlPrefix = `${config.navi.dataSources[0].uri}/v1`;
    server.get('data/network/day/', () => {
      return response;
    });

    return service._fetch(request).then(fetchResponse => {
      assert.deepEqual(fetchResponse.response.rows, response.rows, 'fetch gets response from web service');
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
      const values = NO_VALUE_FILTERS.includes(dimension) ? [] : ['1'];
      return Store.createFragment('bard-request-v2/fragments/filter', {
        type: 'dimension',
        field: dimension,
        parameter: {
          field: 'id'
        },
        operator: 'in',
        values,
        source: 'bardOne'
      });
    };

    const dashboard = {
      id: 10,
      filters: DASHBOARD_FILTERS.map(dimension => makeFilter({ dimension }))
    };

    const makeRequest = (data, filters) => ({
      clone() {
        return cloneDeep(this);
      },
      serialize() {
        return cloneDeep(this);
      },
      addFilter(filter) {
        this.filters.push(filter);
      },
      table: 'table1',
      filters: filters || [makeFilter({ dimension: `${DIMENSIONS[data + 4]}` })],
      sorts: [],
      columns: [
        { type: 'timeDimension', field: 'table1.dateTime', parameters: { grain: 'day' } },
        { type: 'metric', field: 'adClicks', parameters: {} }
      ],
      tableMetadata: {
        dimensionIds: VALID_FILTERS
      },
      requestVersion: '2.0',
      data,
      dataSource: 'bardOne'
    });

    const widgets = [
      {
        dashboard,
        id: 1,
        requests: [makeRequest(0), makeRequest(1, []), makeRequest(2)]
      },
      {
        dashboard,
        id: 2,
        requests: [makeRequest(3)]
      },
      {
        dashboard,
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
      widget1.map(result => get(result, 'request.filters').map(filter => get(filter, 'field'))),
      [['property', 'os'], ['os'], ['userCountry', 'os']],
      'Applicable global filters are applied to widget 1 requests'
    );

    assert.deepEqual(
      widget2.map(result => get(result, 'request.filters').map(filter => get(filter, 'field'))),
      [['screenType', 'os']],
      'Applicable global filters are applied to widget 2 requests'
    );

    assert.deepEqual(
      widget3.map(result => get(result, 'request.filters').map(filter => get(filter, 'field'))),
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

  test('multi-datasource validFilters', function(assert) {
    assert.expect(4);
    const request = {
      table: 'foo',
      filters: [
        {
          type: 'timeDimension',
          field: 'foo.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['P7D', 'current']
        }
      ],
      columns: [
        { type: 'timeDimension', field: 'network.dateTime', parameters: { grain: 'day' } },
        { type: 'metric', field: 'adClicks', parameters: {} }
      ],
      requestVersion: '2.0',
      tableMetadata: {
        dimensionIds: ['ham', 'spam']
      },
      dataSource: 'one'
    };

    const service = this.owner.lookup('service:dashboard-data');
    assert.notOk(
      service._isFilterValid(request, { columnMetadata: { id: 'ham' }, source: 'two' }),
      'even though dimension id is valid datasource does not match'
    );
    assert.ok(
      service._isFilterValid(request, { columnMetadata: { id: 'ham' }, source: 'one' }),
      'dimension id is valid and datasource matches'
    );
    assert.notOk(
      service._isFilterValid(request, { columnMetadata: { id: 'scam' }, source: 'one' }),
      'dimension id is invalid and datasource matches'
    );
    assert.notOk(
      service._isFilterValid(request, { dimension: { id: 'scam', source: 'two' } }),
      'neither dimension id is valid nor datasource matches'
    );
  });
});
