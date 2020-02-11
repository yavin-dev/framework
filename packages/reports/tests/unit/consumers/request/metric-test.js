import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestActions } from 'navi-reports/services/request-action-dispatcher';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { A as arr } from '@ember/array';

let Store, MetadataService, AdClicks, PageViews, CurrentModel, Consumer, Revenue;

module('Unit | Consumer | request metric', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    Store = this.owner.lookup('service:store');

    MetadataService = this.owner.lookup('service:bard-metadata');

    Consumer = this.owner.lookup('consumer:request/metric');
    CurrentModel = {
      request: Store.createFragment('bard-request/request', { metrics: [] })
    };

    // Isolate test to focus on only this consumer
    let requestActionDispatcher = this.owner.lookup('service:request-action-dispatcher');
    requestActionDispatcher._registeredConsumers = [];
    requestActionDispatcher.registerConsumer('request/metric');

    return MetadataService.loadMetadata().then(() => {
      AdClicks = MetadataService.getById('metric', 'adClicks');
      PageViews = MetadataService.getById('metric', 'pageViews');
      Revenue = MetadataService.getById('metric', 'revenue');
    });
  });

  test('ADD_METRIC', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_METRIC, { currentModel: CurrentModel }, AdClicks);
    });

    assert.deepEqual(
      get(CurrentModel, 'request.metrics').mapBy('metric')[0],
      AdClicks,
      'addMetric adds the given metric to the request'
    );
  });

  test('REMOVE_METRIC', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_METRIC, { currentModel: CurrentModel }, AdClicks);
      Consumer.send(RequestActions.REMOVE_METRIC, { currentModel: CurrentModel }, AdClicks);
    });

    assert.ok(get(CurrentModel, 'request.metrics.length') === 0, 'The given metric is removed from the request');
  });

  test('REMOVE_METRIC_FRAGMENT', function(assert) {
    assert.expect(1);

    run(() => {
      Consumer.send(RequestActions.ADD_METRIC, { currentModel: CurrentModel }, AdClicks);
      Consumer.send(
        RequestActions.REMOVE_METRIC_FRAGMENT,
        { currentModel: CurrentModel },
        CurrentModel.request.metrics.firstObject
      );
    });

    assert.ok(get(CurrentModel, 'request.metrics.length') === 0, 'The given metric is removed from the request');
  });

  test('UPDATE_METRIC_PARAM', async function(assert) {
    assert.expect(3);

    const currentModel = {
      request: Store.createFragment('bard-request/request', {
        metrics: arr([
          {
            metric: Revenue,
            parameters: {
              currency: 'USD'
            }
          }
        ])
      })
    };
    const metric = currentModel.request.metrics.firstObject;

    assert.equal(metric.parameters.currency, 'USD', 'Parameter set to USD initially');

    run(() => {
      Consumer.send(RequestActions.UPDATE_METRIC_PARAM, { currentModel }, 'revenue(currency=USD)', 'EUR', 'currency');
    });

    assert.equal(metric.parameters.currency, 'EUR', 'Parameter updates from consumer action');

    run(() => {
      Consumer.send(RequestActions.UPDATE_METRIC_PARAM, { currentModel }, 'foo', 'USD', 'currency');
    });

    assert.deepEqual(
      metric.parameters,
      { currency: 'EUR' },
      "Sending an update action with an invalid metric name doens't change the parameters object"
    );
  });

  test('ADD_METRIC_FILTER', function(assert) {
    assert.expect(2);

    assert.equal(get(CurrentModel, 'request.metrics.length'), 0, 'The request starts with no metrics');

    run(() => {
      Consumer.send(RequestActions.ADD_METRIC_FILTER, { currentModel: CurrentModel }, AdClicks);
    });

    assert.deepEqual(
      get(CurrentModel, 'request.metrics').mapBy('metric'),
      [AdClicks],
      'When a metric filter is added, the metric is added too'
    );
  });

  test('DID_UPDATE_TIME_GRAIN', function(assert) {
    assert.expect(2);

    run(() => {
      Consumer.send(RequestActions.ADD_METRIC, { currentModel: CurrentModel }, AdClicks);
      Consumer.send(RequestActions.ADD_METRIC, { currentModel: CurrentModel }, PageViews);
    });

    assert.deepEqual(
      get(CurrentModel, 'request.metrics').mapBy('metric'),
      [AdClicks, PageViews],
      'Both given metrics are added to request'
    );

    Consumer.send(
      RequestActions.DID_UPDATE_TIME_GRAIN,
      { currentModel: CurrentModel },
      {
        metrics: [AdClicks] // Time grain with no page views
      }
    );

    assert.deepEqual(
      get(CurrentModel, 'request.metrics').mapBy('metric'),
      [AdClicks],
      'Page views metric is removed since it was not found in the new time grain'
    );
  });
});
