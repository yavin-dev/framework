import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import { run } from '@ember/runloop';
import type StoreService from '@ember-data/store';
import type RollupConsumer from 'navi-reports/consumers/request/rollup';
import type RequestFragment from 'navi-core/models/request';
import type { Column } from '@yavin/client/request';

let Store: StoreService;
let Consumer: RollupConsumer;
let CurrentModel: { request: RequestFragment };
let OS: Column;
let AGE: Column;
let DEVICE_TYPE: Column;
let Route: { modelFor: () => { request: RequestFragment } };
const routeFor = (request: RequestFragment) => ({ modelFor: () => ({ request }) });

module('Unit | Consumer | request rollup', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    Store = this.owner.lookup('service:store');

    Consumer = this.owner.lookup('consumer:request/rollup');

    OS = {
      cid: 'c1',
      type: 'dimension',
      field: 'os',
      parameters: { field: 'id' },
    };

    AGE = {
      cid: 'c2',
      type: 'dimension',
      field: 'age',
      parameters: { field: 'id' },
    };

    DEVICE_TYPE = {
      cid: 'c3',
      type: 'dimension',
      field: 'deviceType',
      parameters: { field: 'id' },
    };

    CurrentModel = {
      request: Store.createFragment('request', {
        table: 'network',
        limit: null,
        dataSource: 'bardOne',
        requestVersion: '2.0',
        columns: [OS, AGE, DEVICE_TYPE],
        filters: [],
        sorts: [],
      }),
    };

    Route = routeFor(CurrentModel.request);

    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/rollup');
  });

  test('PUSH_ROLLUP_COLUMN', function (assert) {
    assert.expect(2);
    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, OS);
    });

    assert.deepEqual(CurrentModel.request?.rollup?.columnCids[0], 'c1', 'pushes requested column to rollup on request');

    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, AGE);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, DEVICE_TYPE);
    });

    assert.deepEqual(
      CurrentModel.request.rollup?.columnCids,
      ['c1', 'c2', 'c3'],
      'Columns are added in the right order'
    );
  });

  test('REMOVE_ROLLUP_COLUMN', function (assert) {
    assert.expect(1);
    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, OS);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, AGE);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, DEVICE_TYPE);
      Consumer.send(RequestActions.REMOVE_ROLLUP_COLUMN, Route, AGE);
    });

    assert.deepEqual(CurrentModel.request.rollup?.columnCids, ['c1', 'c3'], 'The correct columns is removed');
  });

  test('UPDATE_GRAND_TOTAL', function (assert) {
    assert.expect(2);
    run(() => {
      Consumer.send(RequestActions.UPDATE_GRAND_TOTAL, Route, true);
    });

    assert.ok(CurrentModel.request.rollup.grandTotal, 'Grand total is updated to true');

    run(() => {
      Consumer.send(RequestActions.UPDATE_GRAND_TOTAL, Route, false);
    });

    assert.notOk(CurrentModel.request.rollup.grandTotal, 'Grand total is back to false');
  });

  test('REMOVE_COLUMN_FRAGMENT', function (assert) {
    assert.expect(1);
    run(() => {
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, OS);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, AGE);
      Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, DEVICE_TYPE);
      Consumer.send(RequestActions.REMOVE_COLUMN_FRAGMENT, Route, AGE);
    });
    assert.deepEqual(CurrentModel.request.rollup?.columnCids, ['c1', 'c3'], 'The correct columns is removed');
  });

  test('Column not in request assertion', function (assert) {
    assert.throws(() => {
      run(() => {
        Consumer.send(RequestActions.PUSH_ROLLUP_COLUMN, Route, {
          cid: 'c7',
          type: 'dimension',
          field: 'os',
          parameters: { field: 'id' },
        });
      });
    }, 'Assertion is thrown when column is added that is not in the request');
  });
});
