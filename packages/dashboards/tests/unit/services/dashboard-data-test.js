import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import config from 'ember-get-config';

module('Unit | Service | dashboard data', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await this.owner.lookup('service:bard-metadata').loadMetadata();
  });

test('fetch data for widget', async function(assert) {
  assert.expect(9);

  const service = this.subject({
    _fetch(request) {
      // Skip the ws data fetch for this test
      return Ember.RSVP.resolve({
        request,
        response: { data: request.data }
      });
    }
  });

  test('fetch data for widget', function(assert) {
    assert.expect(9);

    let service = this.owner.factoryFor('service:dashboard-data').create({
      _fetch(request) {
        // Skip the ws data fetch for this test
        return resolve(request);
      }
    });

    assert.deepEqual(service.fetchDataForWidgets(1, []), {}, 'no widgets returns empty data object');

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
    logicalTable: {
      table: { name: 'table1' },
      timeGrain: { dimensionIds: [] }
    },
    data,
    filters: filters || []
  });

  const dashboard = {
    filters: []
  };

  let widgets = [
      { id: 1, dashboard: cloneDeep(dashboard), requests: [makeRequest(1), makeRequest(2), makeRequest(3)] },
      { id: 2, dashboard: cloneDeep(dashboard), requests: [makeRequest(4)] },
      { id: 3, dashboard: cloneDeep(dashboard), requests: [] }
    ],
    data = service.fetchDataForWidgets(1, widgets);

    assert.deepEqual(Object.keys(data), ['1', '2', '3'], 'data is keyed by widget id');

    assert.ok(get(data, '1.isPending'), 'data uses a promise proxy');

  await wait();

  assert.deepEqual(
    get(data, '1')
      .toArray()
      .map(res => get(res, 'response.data')),
    [1, 2, 3],
    'data for widget is an array of request responses'
  );

  /* == Decorators == */
  data = service.fetchDataForWidgets(1, widgets, [obj => merge({}, obj, { data: obj.data + 1 })]);

  await wait();

  assert.deepEqual(
    get(data, '1')
      .toArray()
      .map(obj => get(obj, 'response.data')),
    [2, 3, 4],
    'each response is modified by the decorators'
  );

  /* == Options == */
  let optionsObject = {
    page: 1
  };

  service.set('dashboardId', 1);
  service.set('_fetch', (request, options) => {
    assert.equal(options, optionsObject, 'options object is passed on to data fetch method');

    let uiViewHeaderElems = options.customHeaders.uiView.split('.');

    assert.equal(uiViewHeaderElems[1], 1, 'uiView header has the dashboard id');

    assert.equal(uiViewHeaderElems[3], 2, 'uiView header has the widget id');

    assert.ok(uiViewHeaderElems[2], 'uiView header has a random uuid attached to the end');

    return Ember.RSVP.resolve({});
  });

  await service.fetchDataForWidgets(
    1,
    [{ id: 2, dashboard: cloneDeep(dashboard), requests: [makeRequest(4)] }],
    [],
    optionsObject
  );
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
});

test('global filter application and error injection.', async function(assert) {
  assert.expect(4);

  const VALID_FILTERS = ['dim1', 'dim3'];
  const DASHBOARD_FILTERS = ['dim1', 'dim2'];

  const service = this.subject({
    _fetch(request) {
      // Skip the ws data fetch for this test
      return Ember.RSVP.resolve({
        request,
        response: {
          meta: {
            errors: [{ title: 'Server Error' }]
          }
        }
      });
    }
  });

  const makeFilter = ({ dimension }) => ({ dimension: { name: dimension } });

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
    addFilter(filter) {
      this.filters.push(filter);
    },
    logicalTable: {
      table: { name: 'table1' },
      timeGrain: { dimensionIds: VALID_FILTERS }
    },
    data,
    filters: filters || [makeFilter({ dimension: `original dim${data}` })]
  });

  const widgets = [
    {
      dashboard: cloneDeep(dashboard),
      id: 1,
      requests: [makeRequest(1), makeRequest(2, []), makeRequest(3)]
    },
    {
      dashboard: cloneDeep(dashboard),
      id: 2,
      requests: [makeRequest(4)]
    },
    {
      dashboard: cloneDeep(dashboard),
      id: 3,
      requests: []
    }
  ];

  const data = service.fetchDataForWidgets(1, widgets);

  const widget1 = await get(data, '1');
  const widget2 = await get(data, '2');
  const widget3 = await get(data, '3');

  assert.deepEqual(
    widget1.map(result => get(result, 'request.filters').map(filter => get(filter, 'dimension.name'))),
    [['original dim1', 'dim1'], ['dim1'], ['original dim3', 'dim1']],
    'Applicable global filters are applied to widget 1 requests'
  );

  assert.deepEqual(
    widget2.map(result => get(result, 'request.filters').map(filter => get(filter, 'dimension.name'))),
    [['original dim4', 'dim1']],
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
          detail: '"dim2" is not a dimension in the "table1" table.',
          title: 'Invalid Filter'
        }
      ],
      [
        {
          title: 'Server Error'
        },
        {
          detail: '"dim2" is not a dimension in the "table1" table.',
          title: 'Invalid Filter'
        }
      ],
      [
        {
          title: 'Server Error'
        },
        {
          detail: '"dim2" is not a dimension in the "table1" table.',
          title: 'Invalid Filter'
        }
      ]
    ],
    'Errors are injected into the response.'
  );
});
