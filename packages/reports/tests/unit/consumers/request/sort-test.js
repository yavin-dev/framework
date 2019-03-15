import { getOwner } from '@ember/application';
import { A as arr } from '@ember/array';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';

module('Unit | Consumer | request sort', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/sort');
  });

  test('UPSERT_SORT', function(assert) {
    assert.expect(3);

    const addDateTimeSort = direction => {
      assert.equal(direction, 'desc', 'dateTimeSort is added when not present in the request');
    };

    const addSortByMetricName = (metricName, direction) => {
      assert.deepEqual(
        [metricName, direction],
        ['click', 'desc'],
        'metricSort is added when not present in the request'
      );
    };

    let currentModel = {
        request: {
          sort: arr([]),
          addDateTimeSort,
          addSortByMetricName
        }
      },
      consumer = this.owner.lookup('consumer:request/sort');

    consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'dateTime', 'desc');
    consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'click', 'desc');

    currentModel.request.sort = arr([
      EmberObject.create({
        metric: { metric: { name: 'dateTime' }, canonicalName: 'dateTime' }
      })
    ]);
    consumer.send(RequestActions.UPSERT_SORT, { currentModel }, 'dateTime', 'desc');
    assert.equal(currentModel.request.sort[0].direction, 'desc', 'sort direction is updated');
  });

  test('REMOVE_SORT', function(assert) {
    assert.expect(1);

    const removeSortByMetricName = metricName => {
      assert.equal(metricName, 'click', 'removeSortByMetricName is called with correct metric name');
    };

    let currentModel = { request: { removeSortByMetricName } },
      consumer = this.owner.lookup('consumer:request/sort');

    consumer.send(RequestActions.REMOVE_SORT, { currentModel }, 'click');
  });

  test('REMOVE_SORT_WITH_PARAM', function(assert) {
    assert.expect(2);

    let parameters = { currency: 'USD' },
      revenueUSD = { metric: { name: 'revenue' } };

    const removeSortMetricWithParam = (metric, parameters) => {
      assert.deepEqual(metric, revenueUSD, 'removeSortMetricWithParam is called with correct metric');
      assert.deepEqual(parameters, { currency: 'USD' }, 'removeSortMetricWithParam is called with correct parameters');
    };

    let currentModel = { request: { removeSortMetricWithParam } },
      consumer = this.owner.lookup('consumer:request/sort');

    consumer.send(RequestActions.REMOVE_SORT_WITH_PARAM, { currentModel }, revenueUSD, parameters);
  });

  test('REMOVE_SORT_BY_METRIC_MODEL', function(assert) {
    assert.expect(1);

    let adClicks = { name: 'adClicks' };

    const removeSortMetricByModel = metric => {
      assert.deepEqual(metric, adClicks, 'removeSortMetricByModel is called with correct metric');
    };

    let currentModel = { request: { removeSortMetricByModel } },
      consumer = this.owner.lookup('consumer:request/sort');

    consumer.send(RequestActions.REMOVE_SORT_BY_METRIC_MODEL, { currentModel }, adClicks);
  });

  test('REMOVE_METRIC', function(assert) {
    assert.expect(1);

    const adClicks = { name: 'adClicks' },
      consumer = this.owner.lookup('consumer:request/sort');

    const removeSortMetricByModel = metric => {
      assert.deepEqual(metric, adClicks, 'REMOVE_SORT_BY_METRIC_MODEL is dispatched with correct metric');
    };

    let currentModel = { request: { removeSortMetricByModel } };

    /* == Remove a metric == */
    consumer.send(RequestActions.REMOVE_METRIC, { currentModel }, adClicks);
  });

  test('REMOVE_METRIC_WITH_PARAM', function(assert) {
    assert.expect(2);

    const parameters = { currency: 'USD' },
      revenueUSD = { metric: { name: 'revenue' } },
      consumer = this.owner.lookup('consumer:request/sort');

    const removeSortMetricWithParam = (metric, parameters) => {
      assert.deepEqual(metric, revenueUSD, 'REMOVE_SORT_WITH_PARAM is dispatched with correct metric');
      assert.deepEqual(parameters, { currency: 'USD' }, 'REMOVE_SORT_WITH_PARAM is dispatched with correct parameters');
    };

    let currentModel = { request: { removeSortMetricWithParam } };

    /* == Remove a parameterized metric == */
    consumer.send(RequestActions.REMOVE_METRIC_WITH_PARAM, { currentModel }, revenueUSD, parameters);
  });
});
