import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import type StoreService from '@ember-data/store';
import type LimitConsumer from 'navi-reports/consumers/request/limit';
import type RequestFragment from 'navi-core/models/request';
import { run } from '@ember/runloop';

let Store: StoreService;
let Consumer: LimitConsumer;
let CurrentModel: { request: RequestFragment };
let Route: { modelFor: () => { request: RequestFragment }; routeName: string };

module('Unit | Consumer | request limit', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    Store = this.owner.lookup('service:store');

    Consumer = this.owner.lookup('consumer:request/limit');

    CurrentModel = {
      request: Store.createFragment('request', {
        table: 'network',
        limit: null,
        dataSource: 'bardOne',
        requestVersion: '2.0',
        columns: [],
        filters: [],
        sorts: [],
      }),
    };

    Route = {
      modelFor: () => CurrentModel,
      routeName: 'whatever',
    };
  });

  test('UPDATE LIMIT', function (assert) {
    assert.expect(5);
    run(() => {
      Consumer.send(RequestActions.UPDATE_LIMIT, Route, 10);
    });

    assert.equal(CurrentModel.request.limit, 10, 'Sets request limit to 10');

    run(() => {
      Consumer.send(RequestActions.UPDATE_LIMIT, Route, 12000);
    });

    assert.equal(CurrentModel.request.limit, 10000, 'Sets request limit to max when given a large number');

    run(() => {
      Consumer.send(RequestActions.UPDATE_LIMIT, Route, null);
    });

    assert.equal(CurrentModel.request.limit, null, 'Sets request limit to null to pick up default');

    run(() => {
      Consumer.send(RequestActions.UPDATE_LIMIT, Route, '45');
    });

    assert.equal(CurrentModel.request.limit, 45, 'Strings get normalized to ints');

    run(() => {
      Consumer.send(RequestActions.UPDATE_LIMIT, Route, 'moose');
    });

    assert.equal(CurrentModel.request.limit, null, 'NaN get normalized to null');
  });
});
