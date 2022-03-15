import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import RequestFragment from 'navi-core/models/request';
import StoreService from 'ember-data/store';
import { TestContext } from 'ember-test-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import SortConsumer from 'navi-reports/consumers/request/sort';
import ColumnFragment from 'navi-core/models/request/column';
import { canonicalizeMetric } from 'navi-data/utils/metric';

const timeDimension = {
  type: 'timeDimension',
  field: 'network.dateTime',
  parameters: { grain: 'day' },
  source: 'bardOne',
};
const metric = {
  type: 'metric',
  field: 'adClicks',
  parameters: {},
  source: 'bardOne',
  cid: '1234567890',
};
const metricWithParam = {
  type: 'metric',
  field: 'revenue',
  parameters: { currency: 'USD' },
  source: 'bardOne',
  cid: '0987654321',
};
const dimension = {
  type: 'dimension',
  field: 'age',
  parameters: { field: 'id' },
  source: 'bardOne',
};

let Consumer: SortConsumer;
let Store: StoreService;

const routeFor = (request: RequestFragment) => ({ modelFor: () => ({ request }) });
const getSorts = (request: RequestFragment) =>
  Object.fromEntries(
    request.sorts.map((s) => {
      const canonicalName = canonicalizeMetric({ metric: s.field, parameters: s.parameters });
      return [canonicalName, s.direction];
    })
  );

module('Unit | Consumer | request sort', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    // Isolate test to focus on only this consumer
    const requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/sort');

    Store = this.owner.lookup('service:store') as StoreService;
    Consumer = this.owner.lookup('consumer:request/sort') as SortConsumer;

    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await naviMetadata.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('UPSERT_SORT', function (assert) {
    const request: RequestFragment = Store.createFragment('request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension, metric, dimension],
      filters: [],
      sorts: [],
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
      },
      'The sorts are added only for columns that are sortable'
    );

    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(0), 'asc');
    Consumer.send(RequestActions.UPSERT_SORT, route, request.columns.objectAt(1), 'asc');

    assert.deepEqual(
      getSorts(request),
      {
        'network.dateTime(grain=day)': 'asc',
        adClicks: 'asc',
      },
      'The sorts are updated'
    );
  });

  test('REMOVE_SORT', function (assert) {
    const request: RequestFragment = Store.createFragment('request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension, metric, dimension],
      filters: [],
      sorts: [{ ...metric, direction: 'asc' }],
    });

    const route = routeFor(request);

    assert.deepEqual(getSorts(request), { adClicks: 'asc' }, 'The existing sorts are correct');
    Consumer.send(RequestActions.REMOVE_SORT, route, request.columns.objectAt(1));

    assert.deepEqual(getSorts(request), {}, 'The adClicks sort is removed');
  });

  test('REMOVE_COLUMN_FRAGMENT', function (assert) {
    const request: RequestFragment = Store.createFragment('request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [timeDimension],
      filters: [],
      sorts: [{ ...timeDimension, direction: 'desc' }],
    });

    assert.deepEqual(getSorts(request), { 'network.dateTime(grain=day)': 'desc' }, 'The existing sort is correct');

    const route = routeFor(request);

    const first = request.columns.firstObject as ColumnFragment;
    request.removeColumn(first);
    Consumer.send(RequestActions.REMOVE_COLUMN_FRAGMENT, route, first);

    assert.deepEqual(getSorts(request), {}, 'The sorts are removed');
  });

  test('UPDATE_COLUMN_FRAGMENT_WITH_PARAMS', function (assert) {
    const revenueWithDiffParam = { ...metricWithParam, cid: '0000000000', parameters: { currency: 'GBP' } };
    const request: RequestFragment = Store.createFragment('request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [metricWithParam], // revenue(currency=USD)
      filters: [],
      sorts: [
        { ...metricWithParam, direction: 'desc' }, // revenue(currency=USD)
        { ...revenueWithDiffParam, direction: 'asc' }, // revenue(currency=GBP)
        { ...metric, direction: 'desc' }, // adClicks
      ],
    });

    assert.deepEqual(
      getSorts(request),
      {
        adClicks: 'desc',
        'revenue(currency=GBP)': 'asc',
        'revenue(currency=USD)': 'desc',
      },
      'The existing sort is correct'
    );

    const route = routeFor(request);

    const first = request.columns.firstObject as ColumnFragment;
    first.parameters.currency = 'CAD'; // USD -> CAD
    Consumer.send(RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS, route, first);

    assert.deepEqual(
      getSorts(request),
      {
        adClicks: 'desc',
        'revenue(currency=GBP)': 'asc',
        'revenue(currency=CAD)': 'desc',
      },
      'The sorts matching base metric have correctly updated params'
    );
  });
});
