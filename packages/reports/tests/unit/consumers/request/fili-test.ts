import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import config from 'ember-get-config';
import type { TestContext as Context } from 'ember-test-helpers';
import type Route from '@ember/routing/route';
import type FiliConsumer from 'navi-reports/consumers/request/fili';
import type StoreService from '@ember-data/store';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type { NaviDataSource } from 'navi-config';
import type RequestFragment from 'navi-core/models/bard-request-v2/request';

let consumer: FiliConsumer;
const dispatchedActions: string[] = [];
const dispatchedActionArgs: Array<unknown[]> = [];
let originalDataSources: NaviDataSource[];

const MockDispatcher = {
  dispatch(action: string, _route: Route, ...args: unknown[]) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(args);
  },
};

interface TestContext extends Context {
  metadataService: NaviMetadataService;
}

module('Unit | Consumer | request fili', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;
    originalDataSources = config.navi.dataSources;

    consumer = this.owner
      .factoryFor('consumer:request/fili')
      .create({ requestActionDispatcher: MockDispatcher }) as FiliConsumer;
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  hooks.afterEach(async function () {
    config.navi.dataSources = originalDataSources;
  });

  test('UPDATE_FILTER', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'month' },
          operator: 'bet',
          values: ['2021-01-01T00:00:00.000Z', '2021-02-01T00:00:00.000Z'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [],
    });

    const modelFor = () => ({ request });

    consumer.send(RequestActions.UPDATE_FILTER, { modelFor }, request.dateTimeFilter, {
      parameters: { grain: 'isoWeek' },
    });
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'When the filter grain is updated, another request to update the filter values is fired off'
    );

    const newValues = ['2020-12-28T00:00:00.000Z', '2021-02-22T00:00:00.000Z'];
    request.dateTimeFilter!.values = newValues;
    assert.deepEqual(
      dispatchedActionArgs[0],
      [request.dateTimeFilter, { values: newValues }],
      'UPDATE_FILTER is dispatched with the updated values for the filter'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    request.dateTimeFilter!.values = ['P1D', 'current'];
    request.dateTimeFilter!.parameters.grain = 'day';

    consumer.send(RequestActions.UPDATE_FILTER, { modelFor }, request.dateTimeFilter, {
      parameters: { grain: 'isoWeek' },
    });
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'When the filter grain is updated, another request to update the filter values is fired off'
    );

    assert.deepEqual(
      dispatchedActionArgs[0],
      [request.dateTimeFilter, { values: ['P1W', 'current'] }],
      'UPDATE_FILTER is dispatched with the updated values for the filter'
    );
  });

  test('UPDATE_FILTER - update column grain', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'month' },
          operator: 'bet',
          values: ['2021-01-01T00:00:00.000Z', '2021-02-01T00:00:00.000Z'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'month' },
          source: 'bardOne',
        },
      ],
    });

    const modelFor = () => ({ request });

    consumer.send(RequestActions.UPDATE_FILTER, { modelFor }, request.dateTimeFilter, {
      parameters: { grain: 'isoWeek' },
    });
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER, RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS],
      'When the filter grain is updated, another request to update the filter values is fired off'
    );

    const newValues = ['2020-12-28T00:00:00.000Z', '2021-02-22T00:00:00.000Z'];
    request.dateTimeFilter!.values = newValues;
    assert.deepEqual(
      dispatchedActionArgs[0],
      [request.dateTimeFilter, { values: newValues }],
      'UPDATE_FILTER is dispatched with the updated values for the filter'
    );

    assert.deepEqual(
      dispatchedActionArgs[1],
      [request.timeGrainColumn, 'grain', 'isoWeek'],
      'UPDATE_COLUMN_FRAGMENT_WITH_PARAMS is dispatched with the updated grain for the column'
    );
  });

  test('UPDATE_FILTER - update dimension field', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'dimension',
          field: 'age',
          parameters: { field: 'id' },
          operator: 'in',
          values: ['1', '2', '3'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [],
    });

    const modelFor = () => ({ request });

    const filter = request.filters.objectAt(0);
    consumer.send(RequestActions.UPDATE_FILTER, { modelFor }, filter, {
      parameters: { field: 'desc' },
    });
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'When the filter grain is updated, another request to update the filter values is fired off'
    );

    filter!.parameters.field = 'desc';
    assert.deepEqual(
      dispatchedActionArgs[0],
      [filter, { values: [] }],
      'UPDATE_FILTER is dispatched with the updated values for the filter'
    );
  });

  test('DID_ADD_COLUMN', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const requestExistingFilter = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'month' },
          operator: 'bet',
          values: ['2021-01-01T00:00:00.000Z', '2021-02-01T00:00:00.000Z'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'hour' },
          source: 'bardOne',
        },
      ],
    });

    const routeFor = (request: RequestFragment) => ({ modelFor: () => ({ request }) });

    consumer.send(
      RequestActions.DID_ADD_COLUMN,
      routeFor(requestExistingFilter),
      requestExistingFilter.columns.objectAt(0)
    );
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS],
      'When a date time column is added with an existing date time filter, the column is updated'
    );

    assert.deepEqual(
      dispatchedActionArgs[0],
      [requestExistingFilter.timeGrainColumn, 'grain', 'month'],
      'UPDATE_COLUMN_FRAGMENT_WITH_PARAMS is dispatched with the grain from the existing filter'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    const requestExistingColumn = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'year' },
          source: 'bardOne',
        },
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'hour' },
          source: 'bardOne',
        },
      ],
    });

    consumer.send(
      RequestActions.DID_ADD_COLUMN,
      routeFor(requestExistingColumn),
      requestExistingColumn.columns.objectAt(1)
    );
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS],
      'When a date time column is added with an existing date time column, the new column is updated'
    );

    assert.deepEqual(
      dispatchedActionArgs[0],
      [requestExistingColumn.columns.objectAt(1), 'grain', 'year'],
      'UPDATE_COLUMN_FRAGMENT_WITH_PARAMS is dispatched with the new column to match the grain of the existing one'
    );
  });

  test('UPDATE_COLUMN_FRAGMENT_WITH_PARAMS', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          operator: 'bet',
          values: ['P1D', 'current'],
          source: 'bardOne',
        },
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          source: 'bardOne',
        },
        {
          type: 'metric',
          field: 'adClicks',
          parameters: {},
          source: 'bardOne',
        },
        {
          type: 'dimension',
          field: 'age',
          parameters: { field: 'id' },
          source: 'bardOne',
        },
      ],
    });

    const modelFor = () => ({ request });

    consumer.send(
      RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
      { modelFor },
      request.nonTimeDimensions[0],
      'field',
      'desc'
    );
    assert.deepEqual(dispatchedActions, [], 'no actions are called when a dimension is updated');

    consumer.send(
      RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
      { modelFor },
      request.metricColumns[0],
      'param',
      'val'
    );
    assert.deepEqual(dispatchedActions, [], 'no actions are called when a metric is updated');

    consumer.send(
      RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
      { modelFor },
      request.timeGrainColumn,
      'otherParam',
      'week'
    );
    assert.deepEqual(
      dispatchedActions,
      [],
      'no actions are called when the timeDimension updates a non-grain parameter'
    );

    consumer.send(
      RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
      { modelFor },
      request.timeGrainColumn,
      'grain',
      'week'
    );
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'UPDATE_FILTER is dispatched when the timeDimension column and filter exists and the grain param is updated'
    );
    assert.deepEqual(
      dispatchedActionArgs[0],
      [request.dateTimeFilter, { parameters: { grain: 'week' } }],
      'UPDATE_FILTER is dispatched with the updated grain parameter'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    config.navi.dataSources = [
      ...config.navi.dataSources,
      { name: 'Other Data Source', displayName: 'Other', uri: 'data://stuff', type: 'elide' },
    ];
    request.dataSource = 'Other Data Source';

    consumer.send(
      RequestActions.UPDATE_COLUMN_FRAGMENT_WITH_PARAMS,
      { modelFor },
      request.timeGrainColumn,
      'grain',
      'week'
    );
    assert.deepEqual(dispatchedActions, [], 'no actions are called when the request is for an elide dataSource');
  });

  test('ADD_DIMENSION_FILTER', function (this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('bard-request-v2/request', {
      table: 'network',
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'existingColumnGrain' },
          source: 'bardOne',
        },
      ],
    });

    const route = { modelFor: () => ({ request }) };

    // simulate filter being added
    request.addFilter({
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'newFilterGrain' },
      operator: 'bet',
      values: ['P1D', 'current'],
      source: 'bardOne',
    });

    consumer.send(
      RequestActions.ADD_DIMENSION_FILTER,
      route,
      this.metadataService.getById('dimension', 'age', 'bardOne'),
      { field: 'id' }
    );
    assert.deepEqual(dispatchedActions, [], 'No actions are called when a dimension is updated');

    consumer.send(
      RequestActions.ADD_DIMENSION_FILTER,
      route,
      this.metadataService.getById('timeDimension', 'network.dateTime', 'bardOne'),
      { grain: 'newFilterGrain' }
    );
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'When adding a timeDimension with an existing column, the filter is updated'
    );
    assert.deepEqual(
      dispatchedActionArgs[0],
      [request.filters.objectAt(0), { parameters: { grain: 'existingColumnGrain' } }],
      'The filter is updated to match the existingColumnGrain grain'
    );
  });
});
