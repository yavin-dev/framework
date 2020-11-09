import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import GoalGaugeSerializer, { LegacyGoalGaugeConfig, normalizeGoalGaugeV2 } from 'navi-core/serializers/goal-gauge';
import { GoalGaugeConfig } from 'navi-core/models/goal-gauge';
import { RequestV2 } from 'navi-data/adapters/facts/interface';

module('Unit | Serializer | metric label', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('normalize', function(this: TestContext, assert) {
    const serializer = this.owner.lookup('serializer:goal-gauge') as GoalGaugeSerializer;
    //@ts-expect-error
    assert.deepEqual(serializer.normalize(), { data: null }, 'null is returned for an undefined response');
  });

  test('normalizeGoalGaugeV2', function(this: TestContext, assert) {
    const request: RequestV2 = {
      table: 'tableName',
      columns: [{ type: 'metric', cid: 'cid_rupees', field: 'rupees', parameters: {} }],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    };

    const initialMetaData: LegacyGoalGaugeConfig = {
      version: 1,
      type: 'goal-gauge',
      metadata: {
        metric: 'rupees',
        baselineValue: 200,
        goalValue: 1000
      }
    };

    const initialMetaDataWithObject: LegacyGoalGaugeConfig = {
      version: 1,
      type: 'goal-gauge',
      metadata: {
        metric: {
          metric: 'rupees',
          parameters: {}
        },
        baselineValue: '200',
        goalValue: '1000'
      }
    };
    const goalGaugeV2Config: GoalGaugeConfig = {
      version: 2,
      type: 'goal-gauge',
      metadata: {
        baselineValue: 200,
        goalValue: 1000,
        metricCid: 'cid_rupees'
      }
    };

    assert.deepEqual(
      normalizeGoalGaugeV2(request, initialMetaData),
      goalGaugeV2Config,
      'Config with a metric name stored is successfully converted to a v2 metric label'
    );

    assert.deepEqual(
      normalizeGoalGaugeV2(request, initialMetaDataWithObject),
      goalGaugeV2Config,
      'Config with a metric object stored is successfully converted to a v2 metric label'
    );

    assert.deepEqual(
      normalizeGoalGaugeV2(request, goalGaugeV2Config),
      goalGaugeV2Config,
      'Config with a v2 metric label is unchanged'
    );
  });
});
