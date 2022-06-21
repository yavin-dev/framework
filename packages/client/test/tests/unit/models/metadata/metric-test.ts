import { module, test } from 'qunit';
import MetricMetadataModel, { MetricMetadataPayload } from '@yavin/client/models/metadata/metric';
import { Mock, nullInjector } from '../../../helpers/injector';
import ColumnFunctionMetadataModel from '@yavin/client/models/metadata/column-function';
import { ValueSourceType } from '@yavin/client/models/metadata/elide/dimension';
import { DataType } from '@yavin/client/models/metadata/function-parameter';
import type MetadataServiceInterface from '@yavin/client/services/interfaces/metadata';
import type MetadataModelRegistry from '@yavin/client/models/metadata/registry';
import type { Injector } from '@yavin/client/models/native-with-create';

type RecordsById<Registry> = Partial<{
  [P in keyof Registry]: Record<string, Registry[P]>;
}>;
class MockMetadataService implements Partial<MetadataServiceInterface> {
  mocks: RecordsById<MetadataModelRegistry> = {
    columnFunction: {
      aggregationTrend: new ColumnFunctionMetadataModel(nullInjector, {
        id: 'aggregationTrend',
        name: 'Aggregation Trend',
        description: 'Aggregation and Trend column function',
        source: 'bardOne',
        _parametersPayload: [
          {
            id: 'aggregation',
            name: 'Aggregation',
            source: 'bardOne',
            valueType: DataType.TEXT,
            valueSourceType: ValueSourceType.ENUM,
            _localValues: [
              { id: '7DayAvg', name: '7 Day Average' },
              { id: '28DayAvg', name: '28 Day Average' },
            ],
            defaultValue: '7DayAvg',
          },
          {
            id: 'trend',
            name: 'Trend',
            source: 'bardOne',
            valueType: DataType.TEXT,
            valueSourceType: ValueSourceType.ENUM,
            _localValues: [
              { id: 'DO_D', name: 'Day over Day' },
              { id: 'WO_W', name: 'Week over Week' },
            ],
            defaultValue: 'DO_D',
          },
        ],
      }),
      moneyMetric: new ColumnFunctionMetadataModel(nullInjector, {
        id: 'moneyMetric',
        name: 'Money Metric',
        description: 'Money column function',
        source: 'bardOne',
        _parametersPayload: [
          {
            id: 'currency',
            name: 'Currency',
            source: 'bardOne',
            valueType: DataType.TEXT,
            valueSourceType: ValueSourceType.ENUM,
            _localValues: [
              { id: 'USD', name: 'Dollars' },
              { id: 'EUR', name: 'Euros' },
            ],
            defaultValue: 'USD',
          },
        ],
      }),
    },
  };
  getById<K extends keyof MetadataModelRegistry>(
    type: K,
    id: string,
    _dataSourceName: string
  ): MetadataModelRegistry[K] | undefined {
    return this.mocks[type]?.[id];
  }
}

let MetadataService: MetadataServiceInterface,
  MockInjector: Injector,
  Payload: MetricMetadataPayload,
  Metric: MetricMetadataModel,
  MoneyMetric: MetricMetadataModel,
  ClicksMetric: MetricMetadataModel;

module('Unit | Metadata Model | Metric', function (hooks) {
  hooks.beforeEach(async function () {
    Payload = {
      type: 'field',
      id: 'dayAvgPageViews',
      name: 'Page Views (Daily Avg)',
      category: 'Page Views',
      valueType: 'number',
      isSortable: true,
      source: 'bardOne',
    };
    MetadataService = new MockMetadataService() as unknown as MetadataServiceInterface;
    MockInjector = Mock().meta(MetadataService).build();
    Metric = new MetricMetadataModel(nullInjector, Payload);
    const moneyMetricPayload: MetricMetadataPayload = {
      id: 'metricOne',
      name: 'Metric One',
      columnFunctionId: 'moneyMetric',
      source: 'bardOne',
      valueType: 'number',
      isSortable: true,
      type: 'field',
    };
    MoneyMetric = new MetricMetadataModel(MockInjector, moneyMetricPayload);
    const clicksMetric: MetricMetadataPayload = {
      id: 'metricTwo',
      name: 'Metric Two',
      columnFunctionId: 'aggregationTrend',
      source: 'bardOne',
      valueType: 'number',
      isSortable: true,
      type: 'field',
    };
    ClicksMetric = new MetricMetadataModel(MockInjector, clicksMetric);
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
      isSortable: true,
      type: 'field',
    };
    const metricOne = new MetricMetadataModel(MockInjector, payload);

    const columnFunction = metricOne.columnFunction;
    const expectedColumnFunc = MetadataService.getById('columnFunction', 'moneyMetric', 'bardOne');
    assert.equal(columnFunction, expectedColumnFunc, 'Column function is returned correctly');
    assert.ok(metricOne.hasParameters, 'hasParameters property is computed');

    assert.deepEqual(
      metricOne.parameters.map((param) => param.id),
      ['currency'],
      'Arguments of the associated column function are shown through parameters'
    );

    assert.deepEqual(
      metricOne.getParameter('currency'),
      expectedColumnFunc?.parameters.find((param) => param.id === 'currency'),
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
        isSortable: true,
        source: 'bardOne',
      },
      metric = new MetricMetadataModel(nullInjector, payload);

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
        isSortable: true,
        source: 'bardOne',
      },
      metric = new MetricMetadataModel(nullInjector, payload);

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
    //@ts-expect-error
    const extendedModel = new MetricMetadataModel(nullInjector, {});
    const metricOne = new MetricMetadataModel(
      {
        //@ts-expect-error - mock injector
        lookup(type, name) {
          assert.equal(type, 'service', 'service is looked up');
          assert.equal(name, 'navi-metadata', 'metadata service is looked up');
          return {
            findById() {
              return Promise.resolve(extendedModel);
            },
          };
        },
      },
      //@ts-expect-error - partial metric payload
      {
        id: 'metricOne',
        source: 'bardOne',
      }
    );

    const result = await metricOne.extended;
    assert.strictEqual(result, extendedModel);
  });
});
