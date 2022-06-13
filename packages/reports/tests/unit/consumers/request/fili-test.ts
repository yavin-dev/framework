import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import type { TestContext as Context } from 'ember-test-helpers';
import type Route from '@ember/routing/route';
import type FiliConsumer from 'navi-reports/consumers/request/fili';
import type StoreService from '@ember-data/store';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type RequestFragment from 'navi-core/models/request';
import type YavinClientService from 'navi-data/services/yavin-client';

let consumer: FiliConsumer;
const dispatchedActions: string[] = [];
const dispatchedActionArgs: Array<unknown[]> = [];

const MockDispatcher = {
  dispatch(action: string, _route: Route, ...args: unknown[]) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(args);
  },
};

interface TestContext extends Context {
  metadataService: NaviMetadataService;
  yavinClient: YavinClientService;
}

module('Unit | Consumer | request fili', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;
    this.yavinClient = this.owner.lookup('service:yavin-client');

    consumer = this.owner
      .factoryFor('consumer:request/fili')
      .create({ requestActionDispatcher: MockDispatcher }) as FiliConsumer;
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('UPDATE_FILTER', function (assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('request', {
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
    const request = store.createFragment('request', {
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
    const request = store.createFragment('request', {
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
    const requestExistingFilter = store.createFragment('request', {
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

    const requestExistingColumn = store.createFragment('request', {
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

  test('UPDATE_COLUMN_FRAGMENT_WITH_PARAMS', function (this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('request', {
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

    this.yavinClient.clientConfig.dataSources = [
      ...this.yavinClient.clientConfig.dataSources,
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
    const request = store.createFragment('request', {
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

  test('WILL_UPDATE_TABLE - table with unsupported grain', function (this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'hour' },
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'],
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

    const route = { modelFor: () => ({ request }) };

    // simulate filter being added
    request.addFilter({
      type: 'timeDimension',
      field: 'tableB.dateTime',
      parameters: { grain: 'day' },
      operator: 'bet',
      values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'],
      source: 'bardOne',
    });

    consumer.send(RequestActions.WILL_UPDATE_TABLE, route, this.metadataService.getById('table', 'tableB', 'bardOne'));
    assert.deepEqual(
      dispatchedActions,
      [
        RequestActions.ADD_DIMENSION_FILTER,
        RequestActions.UPDATE_FILTER,
        RequestActions.UPDATE_FILTER,
        RequestActions.ADD_COLUMN_WITH_PARAMS,
      ],
      'A new dateTime filter is added, updated to have the same interval with the new grain, and a new dateTime column is added'
    );

    const tableBDateTimeMetadata = this.metadataService.getById('timeDimension', 'tableB.dateTime', 'bardOne');
    assert.deepEqual(
      dispatchedActionArgs[0],
      [tableBDateTimeMetadata, { grain: 'hour' }],
      'The dateTime filter is added with the current grain'
    );

    assert.deepEqual(
      dispatchedActionArgs[1],
      [
        request.filters.objectAt(1),
        { operator: 'bet', values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'] },
      ],
      'The dateTime filter is updated to have the same interval'
    );

    assert.deepEqual(
      dispatchedActionArgs[2],
      [request.filters.objectAt(1), { parameters: { grain: 'day' } }],
      'The dateTime filter is updated to match the new grain since tableB does not support "hour"'
    );

    assert.deepEqual(
      dispatchedActionArgs[3],
      [tableBDateTimeMetadata, { grain: 'day' }],
      'The dateTime column is added with the new grain'
    );
  });

  test('WILL_UPDATE_TABLE - table with supported grain', function (this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const request = store.createFragment('request', {
      table: 'network',
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'hour' },
          operator: 'bet',
          values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'],
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

    const route = { modelFor: () => ({ request }) };

    // simulate filter being added
    request.addFilter({
      type: 'timeDimension',
      field: 'tableA.dateTime',
      parameters: { grain: 'day' },
      operator: 'bet',
      values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'],
      source: 'bardOne',
    });

    consumer.send(RequestActions.WILL_UPDATE_TABLE, route, this.metadataService.getById('table', 'tableA', 'bardOne'));
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.ADD_DIMENSION_FILTER, RequestActions.UPDATE_FILTER, RequestActions.ADD_COLUMN_WITH_PARAMS],
      'A new dateTime filter is added, updated to have the same interval, and a new dateTime column is added'
    );

    const tableADateTimeMetadata = this.metadataService.getById('timeDimension', 'tableA.dateTime', 'bardOne');
    assert.deepEqual(
      dispatchedActionArgs[0],
      [tableADateTimeMetadata, { grain: 'hour' }],
      'The dateTime filter is added with the current grain'
    );

    assert.deepEqual(
      dispatchedActionArgs[1],
      [
        request.filters.objectAt(1),
        { operator: 'bet', values: ['2015-11-09T00:00:00.000Z', '2015-11-13T00:00:00.000Z'] },
      ],
      'The dateTime filter is updated to have the same interval'
    );

    assert.deepEqual(
      dispatchedActionArgs[2],
      [tableADateTimeMetadata, { grain: 'hour' }],
      'The dateTime column is added with the new grain'
    );
  });
});
