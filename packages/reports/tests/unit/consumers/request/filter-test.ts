import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type NaviMetadataService from 'navi-data/services/navi-metadata';
import type ActionConsumer from 'navi-core/consumers/action-consumer';
import type { TestContext as Context } from 'ember-test-helpers';

interface TestContext extends Context {
  metadataService: NaviMetadataService;
}

let consumer: ActionConsumer,
  dispatchedActions: string[] = [],
  dispatchedActionArgs: Array<unknown[]> = [];

const MockDispatcher = {
  dispatch(action: string, _route: unknown, ...args: unknown[]) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(args);
  },
};

module('Unit | Consumer | request filter', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    consumer = this.owner.factoryFor('consumer:request/filter').create({ requestActionDispatcher: MockDispatcher });
    this.metadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;
    await this.metadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('ADD_METRIC_FILTER', function (this: TestContext, assert) {
    assert.expect(3);

    const metricMetadataModel = this.metadataService.getById('metric', 'pageViews', 'bardOne');
    const filter = { mockFilter: true };
    let modelFor = () => ({
      request: {
        addFilter(filterOptions: unknown) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'metric',
              source: 'bardOne',
              field: 'pageViews',
              parameters: {},
              operator: 'gt',
              values: [0],
            },
            'addFilter is called with correct arguments'
          );
          return filter;
        },
      },
    });

    consumer.send(RequestActions.ADD_METRIC_FILTER, { modelFor }, metricMetadataModel);
    assert.deepEqual(dispatchedActions, [RequestActions.DID_ADD_FILTER], 'DID_ADD_FILTER action was dispatched');
    assert.deepEqual(dispatchedActionArgs, [[filter]], 'The returned filter was passed in');
  });

  test('ADD_DIMENSION_FILTER', function (this: TestContext, assert) {
    assert.expect(4);

    const dimensionMetadataModel = this.metadataService.getById('dimension', 'age', 'bardOne');
    let modelFor = () => ({
      request: {
        addFilter(filterOptions: unknown) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'dimension',
              source: 'bardOne',
              field: 'age',
              parameters: {
                field: 'id',
              },
              operator: 'in',
              values: [],
            },
            'addFilter is called with correct arguments'
          );
        },
      },
    });

    consumer.send(RequestActions.ADD_DIMENSION_FILTER, { modelFor }, dimensionMetadataModel);

    dispatchedActionArgs.length = 0;
    dispatchedActions.length = 0;

    const timeDimensionMetadataModel = this.metadataService.getById('timeDimension', 'network.dateTime', 'bardOne');
    const filter = { mockFilter: true };
    modelFor = () => ({
      request: {
        addFilter(filterOptions) {
          assert.deepEqual(
            filterOptions,
            {
              type: 'timeDimension',
              source: 'bardOne',
              field: 'network.dateTime',
              parameters: {
                grain: 'day',
              },
              operator: 'bet',
              values: ['P1D', 'current'],
            },
            'Correct default operator is added for the metadata type'
          );
          return filter;
        },
      },
    });
    consumer.send(RequestActions.ADD_DIMENSION_FILTER, { modelFor }, timeDimensionMetadataModel);

    assert.deepEqual(dispatchedActions, [RequestActions.DID_ADD_FILTER], 'DID_ADD_FILTER action was dispatched');
    assert.deepEqual(dispatchedActionArgs, [[filter]], 'The returned filter was passed in');
  });
});
