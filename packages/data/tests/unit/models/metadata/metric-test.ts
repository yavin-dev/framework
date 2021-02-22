import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Pretender, { Server } from 'pretender';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import metadataRoutes from 'navi-data/test-support/helpers/metadata-routes';
import MetricMetadataModel, { MetricMetadataPayload } from 'navi-data/models/metadata/metric';
import ColumnFunctionMetadataModel from 'navi-data/models/metadata/column-function';

let Payload: MetricMetadataPayload,
  Metric: MetricMetadataModel,
  MoneyMetric: MetricMetadataModel,
  ClicksMetric: MetricMetadataModel,
  server: Server;

module('Unit | Metadata Model | Metric', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    server = new Pretender(metadataRoutes);
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    Payload = {
      type: 'field',
      id: 'dayAvgPageViews',
      name: 'Page Views (Daily Avg)',
      category: 'Page Views',
      valueType: 'number',
      source: 'bardOne',
    };

    Metric = MetricMetadataModel.create(this.owner.ownerInjection(), Payload);
    const moneyMetricPayload: MetricMetadataPayload = {
      id: 'metricOne',
      name: 'Metric One',
      columnFunctionId: 'moneyMetric',
      source: 'bardOne',
      valueType: 'number',
      type: 'field',
    };
    MoneyMetric = MetricMetadataModel.create(this.owner.ownerInjection(), moneyMetricPayload);
    const clicksMetric: MetricMetadataPayload = {
      id: 'metricTwo',
      name: 'Metric Two',
      columnFunctionId: 'aggregationTrend',
      source: 'bardOne',
      valueType: 'number',
      type: 'field',
    };
    ClicksMetric = MetricMetadataModel.create(this.owner.ownerInjection(), clicksMetric);
  });

  hooks.afterEach(function () {
    server.shutdown();
  });

  test('factory has identifierField defined', function (assert) {
    assert.expect(1);

    assert.equal(MetricMetadataModel.identifierField, 'id', 'identifierField property is set to `id`');
  });

  test('it properly hydrates properties', function (assert) {
    assert.expect(4);

    assert.deepEqual(Metric.id, Payload.id, 'id property is hydrated properly');

    assert.equal(Metric.name, Payload.name, 'name property was properly hydrated');

    assert.equal(Metric.category, Payload.category, 'category property was properly hydrated');

    assert.equal(Metric.valueType, Payload.valueType, 'valueType property was properly hydrated');
  });

  test('Metric with Column Function', async function (assert) {
    assert.expect(4);

    const payload: MetricMetadataPayload = {
      id: 'metricOne',
      name: 'Metric One',
      columnFunctionId: 'moneyMetric',
      source: 'bardOne',
      valueType: 'number',
      type: 'field',
    };
    const metricOne = MetricMetadataModel.create(this.owner.ownerInjection(), payload);

    const columnFunction = metricOne.columnFunction;
    const expectedColumnFunc = this.owner
      .lookup('service:keg')
      .getById('metadata/columnFunction', 'moneyMetric', 'bardOne') as ColumnFunctionMetadataModel;
    assert.equal(columnFunction, expectedColumnFunc, 'Column function is returned correctly');
    assert.ok(metricOne.hasParameters, 'hasParameters property is computed');

    assert.deepEqual(
      metricOne.parameters.map((param) => param.id),
      ['currency'],
      'Arguments of the associated column function are shown through parameters'
    );

    assert.deepEqual(
      metricOne.getParameter('currency'),
      expectedColumnFunc.parameters.find((param) => param.id === 'currency'),
      'the queried column function parameter object is retrieved from parameters'
    );
  });

  test('Metric without Column Function', async function (assert) {
    assert.expect(3);

    let payload: MetricMetadataPayload = {
        type: 'field',
        id: 'dayAvgPageViews',
        name: 'Page Views (Daily Avg)',
        category: 'Page Views',
        valueType: 'number',
        source: 'bardOne',
      },
      metric = MetricMetadataModel.create(this.owner.ownerInjection(), payload);

    assert.deepEqual(metric.parameters, [], 'parameters is an empty array when metric has no column function');

    assert.notOk(metric.hasParameters, 'hasParameters property is false since the metric has no column function');

    assert.strictEqual(
      metric.getParameter('someParam'),
      undefined,
      'getParameter returns falsey value when no parameters are present'
    );
  });

  test('getDefaultParameters', async function (assert) {
    assert.expect(3);

    assert.deepEqual(
      MoneyMetric.getDefaultParameters(),
      { currency: 'USD' },
      'The default values of the metric parameters are returned as a key value pair'
    );

    let payload: MetricMetadataPayload = {
        id: 'dayAvgPageViews',
        name: 'Page Views (Daily Avg)',
        type: 'field',
        category: 'Page Views',
        valueType: 'number',
        source: 'bardOne',
      },
      metric = MetricMetadataModel.create(this.owner.ownerInjection(), payload);

    assert.strictEqual(
      metric.getDefaultParameters(),
      undefined,
      'The method returns undefined when trying to fetch defaults from a metric without parameters'
    );

    assert.deepEqual(
      ClicksMetric.getDefaultParameters(),
      { aggregation: '7DayAvg', trend: 'DO_D' },
      'The method returns all the defaults for all the parameters of the metric'
    );
  });

  test('extended property', async function (assert) {
    assert.expect(3);
    const metricOne = MetricMetadataModel.create(this.owner.ownerInjection(), {
      id: 'metricOne',
      source: 'bardOne',
    });

    const result = await metricOne.extended;
    assert.equal(result?.id, 'metricOne', 'extended attributes model has same id');
    assert.equal(result?.category, 'category', 'extended attributes model has same id');
    assert.equal(result?.name, 'Metric One', 'extended attributes model has same id');
  });
});
