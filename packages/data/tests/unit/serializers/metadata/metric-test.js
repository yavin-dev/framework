import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { MetricOne, MetricTwo, MetricSix } from '../../../helpers/metadata-routes';

let Serializer;

module('Unit | Metadata | Metric Serializer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    Serializer = this.owner.lookup('serializer:metadata/metric');
  });

  test('_normalizeMetrics', function(assert) {
    let testPayload = Object.assign({}, MetricOne, { description: 'desc', type: 'number', metricFunctionId: 'foo' });
    let normalizedMetric = {
      id: 'metricOne',
      name: 'Metric One',
      description: 'desc',
      category: 'category',
      valueType: 'number',
      source: 'bardOne',
      metricFunctionId: 'foo'
    };

    assert.deepEqual(
      Serializer._normalizeMetrics([testPayload], 'bardOne'),
      [normalizedMetric],
      '_normalizeMetrics can normalize a single metric to the right shape'
    );

    testPayload = [
      testPayload,
      Object.assign({}, MetricSix, {
        description: 'desc2',
        type: 'number'
      })
    ];
    let expectedMetrics = [
      normalizedMetric,
      {
        id: 'metricSix',
        name: 'Metric Six',
        description: 'desc2',
        category: 'currencyMetrics',
        valueType: 'number',
        source: 'bardOne'
      }
    ];

    assert.deepEqual(
      Serializer._normalizeMetrics(testPayload, 'bardOne'),
      expectedMetrics,
      'Multiple metrics are normalized correctly'
    );
  });

  test('normalize', function(assert) {
    assert.strictEqual(
      Serializer.normalize({}, 'bardOne'),
      undefined,
      'Serializer returns undefined for a payload with no metrics key'
    );
    assert.strictEqual(Serializer.normalize(), undefined, 'Serializer returns undefined for a falsey payload');

    const source = 'bardOne';
    let payload = {
        metrics: [
          Object.assign({}, MetricSix, {
            description: 'desc',
            type: 'money'
          }),
          Object.assign({}, MetricTwo, {
            description: 'description',
            type: 'number',
            metricFunctionId: 'foonction'
          })
        ]
      },
      expectedMetrics = [
        {
          id: MetricSix.name,
          name: MetricSix.longName,
          category: MetricSix.category,
          description: 'desc',
          valueType: 'money',
          source
        },
        {
          id: MetricTwo.name,
          name: MetricTwo.longName,
          category: MetricTwo.category,
          description: 'description',
          valueType: 'number',
          metricFunctionId: 'foonction',
          source
        }
      ];

    assert.deepEqual(
      Serializer.normalize(payload, source),
      expectedMetrics,
      'normalize successfully normalizes a payload with metrics key'
    );
  });
});
