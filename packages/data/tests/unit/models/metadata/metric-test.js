import { get } from '@ember/object';
import { module, test } from 'qunit';
import MetricMetadataModel from 'navi-data/models/metadata/metric';
import { setupTest } from 'ember-qunit';
import Pretender from 'pretender';

import metadataRoutes from '../../../helpers/metadata-routes';

let Payload, Metric, MoneyMetric, ClicksMetric, server;

module('Unit | Metadata Model | Metric', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    server = new Pretender(metadataRoutes);
    await this.owner.lookup('service:bard-metadata').loadMetadata();

    Payload = {
      id: 'dayAvgPageViews',
      name: 'Page Views (Daily Avg)',
      category: 'Page Views',
      valueType: 'number'
    };

    Metric = MetricMetadataModel.create(this.owner.ownerInjection(), Payload);
    MoneyMetric = MetricMetadataModel.create(this.owner.ownerInjection(), {
      id: 'metricOne',
      metricFunctionId: 'moneyMetric'
    });
    ClicksMetric = MetricMetadataModel.create(this.owner.ownerInjection(), {
      id: 'metricTwo',
      metricFunctionId: 'aggregationTrend'
    });
  });

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('factory has identifierField defined', function(assert) {
    assert.expect(1);

    assert.equal(get(MetricMetadataModel, 'identifierField'), 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function(assert) {
    assert.expect(4);

    assert.deepEqual(Metric.id, Payload.id, 'id property is hydrated properly');

    assert.equal(Metric.name, Payload.name, 'name property was properly hydrated');

    assert.equal(Metric.category, Payload.category, 'category property was properly hydrated');

    assert.equal(Metric.valueType, Payload.valueType, 'valueType property was properly hydrated');
  });

  test('Metric with Metric Function', async function(assert) {
    assert.expect(4);

    const metricOne = MetricMetadataModel.create(this.owner.ownerInjection(), {
      id: 'metricOne',
      metricFunctionId: 'moneyMetric'
    });

    const metricFunction = metricOne.metricFunction;
    const expectedMetricFunc = this.owner
      .lookup('service:keg')
      .getById('metadata/metric-function', 'moneyMetric', 'dummy');
    assert.equal(metricFunction, expectedMetricFunc, 'Metric function is returned correctly');
    assert.ok(metricOne.hasParameters, 'hasParameters property is computed');

    assert.deepEqual(
      metricOne.arguments.map(arg => arg.id),
      ['currency'],
      'Arguments of the associated metric function are shown through arguments'
    );

    assert.deepEqual(
      metricOne.getParameter('currency'),
      expectedMetricFunc.arguments.find(arg => arg.id === 'currency'),
      'the queried metric function argument object is retrieved from parameters'
    );
  });

  test('Metric without Metric Function', async function(assert) {
    assert.expect(3);

    let payload = {
        id: 'dayAvgPageViews',
        name: 'Page Views (Daily Avg)',
        category: 'Page Views',
        valueType: 'number'
      },
      metric = MetricMetadataModel.create(this.owner.ownerInjection(), payload);

    assert.deepEqual(await metric.arguments, [], 'arguments is an empty array when metric has no metric function');

    assert.notOk(await metric.hasParameters, 'hasParameters property is false since the metric has no metric function');

    assert.strictEqual(
      await metric.getParameter('someParam'),
      undefined,
      'getParameter returns falsey value when no parameters are present'
    );
  });

  test('getDefaultParameters', async function(assert) {
    assert.expect(3);

    assert.deepEqual(
      await MoneyMetric.getDefaultParameters(),
      { currency: 'USD' },
      'The default values of the metric parameters are returned as a key value pair'
    );

    let payload = {
        name: 'dayAvgPageViews',
        longName: 'Page Views (Daily Avg)',
        category: 'Page Views',
        valueType: 'number'
      },
      metric = MetricMetadataModel.create(this.owner.ownerInjection(), payload);

    assert.strictEqual(
      await metric.getDefaultParameters(),
      undefined,
      'The method returns undefined when trying to fetch defaults from a metric without parameters'
    );

    assert.deepEqual(
      await ClicksMetric.getDefaultParameters(),
      { aggregation: '7DayAvg', trend: 'DO_D' },
      'The method returns all the defaults for all the parameters of the metric'
    );
  });

  test('extended property', async function(assert) {
    const metricOne = MetricMetadataModel.create(this.owner.ownerInjection(), {
      id: 'metricOne'
    });

    const expected = {
      category: 'category',
      name: 'Metric One',
      id: 'metricOne'
    };

    const result = await metricOne.get('extended');
    assert.ok(
      Object.keys(expected).every(key => result[key] === expected[key]),
      'metric model can fetch extended attributes'
    );
  });
});
