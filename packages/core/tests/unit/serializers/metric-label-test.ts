import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import MetricLabelSerializer, {
  LegacyMetricLabelConfig,
  normalizeMetricLabelV2
} from 'navi-core/serializers/metric-label';
import { MetricLabelConfig } from 'navi-core/models/metric-label';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

module('Unit | Serializer | metric label', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('normalize', function(this: TestContext, assert) {
    const serializer = this.owner.lookup('serializer:metric-label') as MetricLabelSerializer;
    //@ts-expect-error
    assert.deepEqual(serializer.normalize(), { data: null }, 'null is returned for an undefined response');
  });

  test('normalizeMetricLabelV2', function(this: TestContext, assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', cid: 'cid_rupees', field: 'rupees', parameters: {} }],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    };

    const initialMetaData: LegacyMetricLabelConfig = {
      version: 1,
      type: 'metric-label',
      metadata: {
        metric: 'rupees',
        description: 'Rupees',
        format: '0,0.00'
      }
    };

    const initialMetaDataWithObject: LegacyMetricLabelConfig = {
      version: 1,
      type: 'metric-label',
      metadata: {
        metric: {
          metric: 'rupees',
          parameters: {}
        },
        description: 'Rupees',
        format: '0,0.00'
      }
    };
    const metricLabelV2Config: MetricLabelConfig = {
      version: 2,
      type: 'metric-label',
      metadata: {
        format: '0,0.00',
        metricCid: 'cid_rupees'
      }
    };

    assert.deepEqual(
      normalizeMetricLabelV2(request, initialMetaData),
      metricLabelV2Config,
      'Config with a metric name stored is successfully converted to a v2 metric label'
    );

    assert.deepEqual(
      normalizeMetricLabelV2(request, initialMetaDataWithObject),
      metricLabelV2Config,
      'Config with a metric object stored is successfully converted to a v2 metric label'
    );

    assert.deepEqual(
      normalizeMetricLabelV2(request, metricLabelV2Config),
      metricLabelV2Config,
      'Config with a v2 metric label is unchanged'
    );
  });
});
