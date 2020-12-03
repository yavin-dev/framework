import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import StoreService from 'ember-data/store';
import { TestContext } from 'ember-test-helpers';
import SortConsumer from 'dummy/consumers/request/sort';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';

const timeDimension = {
  type: 'timeDimension',
  field: 'network.dateTime',
  parameters: { grain: 'day' },
  source: 'bardOne'
};
const metric = {
  type: 'metric',
  field: 'adClicks',
  parameters: {},
  source: 'bardOne'
};
const dimension = {
  type: 'dimension',
  field: 'age',
  parameters: { field: 'id' },
  source: 'bardOne'
};

let Consumer: SortConsumer;
let Store: StoreService;

const routeFor = (request: RequestFragment) => ({ modelFor: () => ({ request }) });
const getSorts = (request: RequestFragment) =>
  Object.fromEntries(request.sorts.map(s => [s.canonicalName, s.direction]));

module('Unit | Consumer | request sort', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    // Isolate test to focus on only this consumer
    const requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/sort');

    Store = this.owner.lookup('service:store') as StoreService;
    Consumer = this.owner.lookup('consumer:request/sort') as SortConsumer;

    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('UPSERT_SORT', function(assert) {
    const request: RequestFragment = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension, metric, dimension],
      filters: [],
      sorts: []
    });

    const route = routeFor(request);

    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(0), 'desc');
    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(1), 'desc');
    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(2), 'desc');

    assert.deepEqual(
      getSorts(request),
      {
        'network.dateTime(grain=day)': 'desc',
        adClicks: 'desc',
        'age(field=id)': 'desc'
      },
      'The sorts are added'
    );

    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(0), 'asc');
    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(1), 'asc');

    assert.deepEqual(
      getSorts(request),
      {
        'network.dateTime(grain=day)': 'asc',
        adClicks: 'asc',
        'age(field=id)': 'desc'
      },
      'The sorts are added'
    );

    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(2), 'asc');
    assert.deepEqual(
      getSorts(request),
      {
        'network.dateTime(grain=day)': 'asc',
        adClicks: 'asc',
        'age(field=id)': 'asc'
      },
      'The sorts are updated'
    );
  });

  test('REMOVE_SORT', function(assert) {
    const request: RequestFragment = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension, metric, dimension],
      filters: [],
      sorts: [{ ...metric, direction: 'asc' }]
    });

    const route = routeFor(request);

    assert.deepEqual(getSorts(request), { adClicks: 'asc' }, 'The existing sorts are correct');
    Consumer.send(RequestActions.REMOVE_SORT, route, request.columns.objectAt(1));

    assert.deepEqual(getSorts(request), {}, 'The adClicks sort is removed');
  });

  test('REMOVE_COLUMN', function(assert) {
    const request: RequestFragment = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension, metric, dimension],
      filters: [],
      sorts: [
        { ...timeDimension, direction: 'desc' },
        { ...metric, direction: 'desc' },
        { ...dimension, direction: 'desc' }
      ]
    });

    assert.deepEqual(
      getSorts(request),
      {
        'network.dateTime(grain=day)': 'desc',
        adClicks: 'desc',
        'age(field=id)': 'desc'
      },
      'The existing sorts are correct'
    );

    const route = routeFor(request);

    /* == Remove a metric == */
    Consumer.send(RequestActions.REMOVE_COLUMN, route, request.columns.objectAt(0)?.columnMetadata);
    Consumer.send(RequestActions.REMOVE_COLUMN, route, request.columns.objectAt(1)?.columnMetadata);

    assert.deepEqual(getSorts(request), { 'age(field=id)': 'desc' }, 'The first two sorts are removed');

    Consumer.send(RequestActions.REMOVE_COLUMN, route, request.columns.objectAt(2)?.columnMetadata);

    assert.deepEqual(getSorts(request), {}, 'The last sort is removed');
  });

  test('REMOVE_COLUMN_WITH_PARAMS', function(assert) {
    const request: RequestFragment = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension],
      filters: [],
      sorts: [{ ...timeDimension, direction: 'desc' }]
    });

    assert.deepEqual(getSorts(request), { 'network.dateTime(grain=day)': 'desc' }, 'The existing sort is correct');

    const route = routeFor(request);
    /* == Remove a parameterized metric == */
    Consumer.send(RequestActions.REMOVE_COLUMN_WITH_PARAMS, route, request.columns.objectAt(0)?.columnMetadata, {
      grain: 'day'
    });

    assert.deepEqual(getSorts(request), {}, 'The sorts are removed');
  });
});
