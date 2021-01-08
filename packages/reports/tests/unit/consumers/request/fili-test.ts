import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import Route from '@ember/routing/route';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import FiliConsumer from 'navi-reports/consumers/request/fili';
import StoreService from 'ember-data/store';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import config from 'ember-get-config';
import { NaviDataSource } from 'navi-config';

let consumer: FiliConsumer;
const dispatchedActions: string[] = [];
const dispatchedActionArgs: unknown[] = [];
let originalDataSources: NaviDataSource[];

const MockDispatcher = {
  dispatch(action: string, _route: Route, ...args: unknown[]) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(...args);
  }
};

interface TestContext extends Context {
  metadataService: NaviMetadataService;
}

module('Unit | Consumer | request fili', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;
    originalDataSources = config.navi.dataSources;

    consumer = this.owner
      .factoryFor('consumer:request/fili')
      .create({ requestActionDispatcher: MockDispatcher }) as FiliConsumer;
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  hooks.afterEach(async function() {
    config.navi.dataSources = originalDataSources;
  });

  test('UPDATE_COLUMN_FRAGMENT_WITH_PARAMS', function(assert) {
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
          source: 'bardOne'
        }
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
          source: 'bardOne'
        },
        {
          type: 'metric',
          field: 'adClicks',
          parameters: {},
          source: 'bardOne'
        },
        {
          type: 'dimension',
          field: 'age',
          parameters: { field: 'id' },
          source: 'bardOne'
        }
      ]
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
      dispatchedActionArgs,
      [request.dateTimeFilter, { parameters: { grain: 'week' }, values: ['P1W', 'current'] }],
      'UPDATE_FILTER is dispatched with the updated grain parameter'
    );

    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    config.navi.dataSources = [
      ...config.navi.dataSources,
      { name: 'Other Data Source', uri: 'data://stuff', type: 'elide' }
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

  test('ADD_DIMENSION_FILTER', function(this: TestContext, assert) {
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
          source: 'bardOne'
        }
      ]
    });

    const route = { modelFor: () => ({ request }) };

    // simulate filter being added
    request.addFilter({
      type: 'timeDimension',
      field: 'network.dateTime',
      parameters: { grain: 'newFilterGrain' },
      operator: 'bet',
      values: ['P1D', 'current'],
      source: 'bardOne'
    });

    consumer.send(
      RequestActions.ADD_DIMENSION_FILTER,
      route,
      this.metadataService.getById('dimension', 'age', 'bardOne'),
      {}
    );
    assert.deepEqual(dispatchedActions, [], 'Thno actions are called when a dimension is updatede');

    consumer.send(
      RequestActions.ADD_DIMENSION_FILTER,
      route,
      this.metadataService.getById('timeDimension', 'network.dateTime', 'bardOne'),
      {}
    );
    assert.deepEqual(
      dispatchedActions,
      [RequestActions.UPDATE_FILTER],
      'When adding a timeDimension with an existing column, the filter is updated'
    );
    assert.deepEqual(
      dispatchedActionArgs,
      [request.filters.objectAt(0), { parameters: { grain: 'existingColumnGrain' } }],
      'The filter is updated to match the existingColumnGrain grain'
    );
  });
});
