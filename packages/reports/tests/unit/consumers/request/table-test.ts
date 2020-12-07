import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import Route from '@ember/routing/route';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import TableConsumer from 'navi-reports/consumers/request/table';
import { TestContext } from 'ember-test-helpers';
import NaviMetadataService from 'navi-data/services/navi-metadata';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import StoreService from 'ember-data/store';

const dispatchedActions: string[] = [];
const dispatchedActionArgs: unknown[] = [];

const MockDispatcher = {
  dispatch(action: string, _route: Route, ...args: unknown[]) {
    dispatchedActions.push(action);
    dispatchedActionArgs.push(...args);
  }
};

const routeFor = (request: RequestFragment) => ({ modelFor: () => ({ request }) });

let Consumer: TableConsumer;
let MetadataService: NaviMetadataService;
let Store: StoreService;

module('Unit | Consumer | request table', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    dispatchedActions.length = 0;
    dispatchedActionArgs.length = 0;

    Store = this.owner.lookup('service:store') as StoreService;
    Consumer = this.owner
      .factoryFor('consumer:request/table')
      .create({ requestActionDispatcher: MockDispatcher }) as TableConsumer;
    MetadataService = this.owner.lookup('service:navi-metadata') as NaviMetadataService;

    await MetadataService.loadMetadata({ dataSourceName: 'bardOne' });
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
  });

  test('UPDATE_TABLE', function(assert) {
    const request: RequestFragment = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0',
      columns: [],
      filters: [],
      sorts: []
    });

    const newTable = MetadataService.getById('table', 'inventory', 'bardTwo');

    const route = routeFor(request);

    Consumer.send(RequestActions.UPDATE_TABLE, route, newTable);

    assert.deepEqual(dispatchedActions, [RequestActions.DID_UPDATE_TABLE], 'actions are dispatched in correct order');
    assert.deepEqual(dispatchedActionArgs, [newTable], 'actions are dispatched with correct args');
    assert.equal(request.table, 'inventory', 'UPDATE_TABLE updates the table request attribute');
    assert.equal(request.dataSource, 'bardTwo', 'UPDATE_TABLE updates the dataSource request attribute');
  });
});
