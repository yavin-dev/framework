import { moduleFor, test } from 'ember-qunit';
import { setupMock, teardownMock } from '../../helpers/mirage-helper';
import wait from 'ember-test-helpers/wait';
import config from 'ember-get-config';
import Ember from 'ember';

const { get } = Ember;

moduleFor('service:dashboard-data', 'Unit | Service | dashboard data', {
  needs: [
    'model:dashboard',
    'adapter:dashboard',
    'serializer:dashboard',
    'model:dashboard-widget',
    'model:user',
    'transform:fragment',
    'model:fragments/presentation',
    'adapter:dashboard-widget',
    'serializer:dashboard-widget',
    'transform:moment',
    'service:bard-facts',
    'adapter:bard-facts',
    'serializer:bard-facts',
    'service:ajax',
    'config:environment',
    'service:request-decorator',
    'model:visualization',
    'model:goal-gauge',
    'model:line-chart',
    'model:table',
    'adapter:bard-metadata',
    'adapter:dimensions/bard',
    'transform:array',
    'transform:fragment-array',
    'transform:dimension',
    'transform:fragment',
    'transform:metric',
    'transform:moment',
    'transform:table',
    'model:bard-request/request',
    'model:bard-request/fragments/dimension',
    'model:bard-request/fragments/filter',
    'model:bard-request/fragments/interval',
    'model:bard-request/fragments/logicalTable',
    'model:bard-request/fragments/metric',
    'model:bard-request/fragments/sort',
    'model:metadata/table',
    'model:metadata/dimension',
    'model:metadata/metric',
    'model:metadata/time-grain',
    'validator:length',
    'validator:belongs-to',
    'validator:has-many',
    'validator:interval',
    'validator:presence',
    'service:bard-metadata',
    'serializer:bard-request/fragments/logical-table',
    'serializer:bard-request/fragments/interval',
    'serializer:visualization',
    'serializer:report',
    'serializer:user',
    'serializer:bard-metadata',
    'service:keg',
    'service:ajax',
    'service:bard-facts',
    'service:user',
    'service:bard-dimensions'
  ],
  beforeEach() {
    setupMock();

    // Load metadata needed for request fragment
    let metadataService = this.container.lookup('service:bard-metadata');
    return metadataService.loadMetadata();
  },
  afterEach() {
    teardownMock();
  }
});

test('fetch data for dashboard', function(assert) {
  assert.expect(2);

  let mockDashboard = {
    id: 1,
    widgets: Ember.RSVP.resolve([1, 2, 3]),
    get(prop) {
      return this[prop];
    }
  };

  let service = this.subject({
    // Skip the ws data fetch for this test
    fetchDataForWidgets: (id, widgets, decorators, options) => {
      //removing custom headers
      delete options.customHeaders;
      assert.deepEqual(
        options,
        { page: 1, perPage: 10000 },
        'Default pagination options are passed through for widget data fetch'
      );

      return widgets;
    }
  });

  return Ember.run(() => {
    return service.fetchDataForDashboard(mockDashboard).then(dataForWidget => {
      assert.deepEqual(
        dataForWidget,
        [1, 2, 3],
        'widgetData is returned by `fetchDataForWidgets` method'
      );
    });
  });
});

test('fetch data for widget', function(assert) {
  assert.expect(9);

  let service = this.subject({
    _fetch(request) {
      // Skip the ws data fetch for this test
      return Ember.RSVP.resolve(request);
    }
  });

  assert.deepEqual(
    service.fetchDataForWidgets(1, []),
    {},
    'no widgets returns empty data object'
  );

  const makeRequest = data => {
    return {
      serialize: () => data
    };
  };

  let widgets = [
      { id: 1, requests: [makeRequest(1), makeRequest(2), makeRequest(3)] },
      { id: 2, requests: [makeRequest(4)] },
      { id: 3, requests: [] }
    ],
    data = service.fetchDataForWidgets(1, widgets);

  assert.deepEqual(
    Object.keys(data),
    ['1', '2', '3'],
    'data is keyed by widget id'
  );

  assert.ok(get(data, '1.isPending'), 'data uses a promise proxy');

  return wait().then(() => {
    assert.deepEqual(
      get(data, '1').toArray(),
      [1, 2, 3],
      'data for widget is an array of request responses'
    );

    /* == Decorators == */
    data = service.fetchDataForWidgets(1, widgets, [number => number + 1]);
    return wait().then(() => {
      assert.deepEqual(
        get(data, '1').toArray(),
        [2, 3, 4],
        'each response is modified by the decorators'
      );

      /* == Options == */
      let optionsObject = {
        page: 1
      };

      service.set('dashboardId', 1);
      service.set('_fetch', (request, options) => {
        assert.equal(
          options,
          optionsObject,
          'options object is passed on to data fetch method'
        );

        let uiViewHeaderElems = options.customHeaders.uiView.split('.');

        assert.equal(
          uiViewHeaderElems[1],
          1,
          'uiView header has the dashboard id'
        );

        assert.equal(
          uiViewHeaderElems[3],
          2,
          'uiView header has the widget id'
        );

        assert.ok(
          uiViewHeaderElems[2],
          'uiView header has a random uuid attached to the end'
        );
      });
      service.fetchDataForWidgets(
        1,
        [{ id: 2, requests: [makeRequest(4)] }],
        [],
        optionsObject
      );
    });
  });
});

test('_fetch', function(assert) {
  assert.expect(1);

  let service = this.subject(),
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
    assert.deepEqual(
      fetchResponse.get('response.rows'),
      response.rows,
      'fetch gets response from web service'
    );
  });
});

test('_decorate', function(assert) {
  assert.expect(2);

  let service = this.subject(),
    add = number => number + 5,
    subtract = number => number - 3;

  assert.equal(
    service._decorate([add, subtract], 1),
    3,
    'decorate calls each decorator function and passes the result to the next decorator'
  );

  assert.equal(
    service._decorate([], 1),
    1,
    'empty array of decorators has no effect'
  );
});
