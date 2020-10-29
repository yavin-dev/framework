import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { A as arr } from '@ember/array';
import GoalGauge from 'navi-core/components/navi-visualizations/goal-gauge';
import NaviMetadata from 'navi-data/services/navi-metadata';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import StoreService from '@ember-data/store';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import { TestContext } from 'ember-test-helpers';
import { createGlimmerComponent } from 'navi-core/test-support';
import { GoalGaugeConfig } from 'navi-core/models/goal-gauge';

let Store: StoreService;
let Component: GoalGauge;

module('Unit | Component | Goal Gauge', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    Store = this.owner.lookup('service:store') as StoreService;
    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadata;
    await naviMetadata.loadMetadata();

    const response = NaviFactResponse.create({
      //prettier-ignore
      rows: [{ m1: 75 }]
    });
    const request = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      columns: [
        {
          type: 'metric',
          field: 'm1',
          parameters: {},
          alias: '',
          source: 'bardOne',
          cid: 'cid_m1'
        }
      ],
      filters: [{}],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });

    let options = {
      baselineValue: 50,
      goalValue: 100,
      metricCid: 'cid_m1'
    } as GoalGaugeConfig['metadata'];

    const args: GoalGauge['args'] = {
      model: arr([{ request, response }]),
      options
    };
    Component = createGlimmerComponent('component:navi-visualizations/goal-gauge', args) as GoalGauge;
  });

  test('data', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      Component.data,
      {
        columns: [['data', 75]],
        type: 'gauge'
      },
      'data is correctly computed based on actualValue'
    );
  });

  test('gauge', function(assert) {
    assert.expect(2);

    assert.equal(
      Component.gauge.min,
      Component.config.baselineValue,
      'gauge.min is correctly set based on baseline property'
    );

    assert.equal(Component.gauge.max, Component.config.goalValue, 'gauge.max is correctly set based on goal property');
  });

  test('thresholdValues', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      Component.thresholdValues,
      [87.5, 92.5, 100],
      'thresholdValues are correctly computed based on goal & baseline values'
    );
  });

  test('color', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      Component.color,
      {
        pattern: ['#f05050', '#ffc831', '#44b876'],
        threshold: {
          max: 100,
          unit: 'value',
          values: [87.5, 92.5, 100]
        }
      },
      'color is correctly computed based on goal & baseline values'
    );
  });

  test('_formatNumber', function(assert) {
    assert.expect(2);

    assert.equal(
      Component._formatNumber(123456789),
      '123.46M',
      '_formatNumber uses a precision of 2 for numbers under 1B'
    );

    assert.equal(
      Component._formatNumber(9123456789),
      '9.123B',
      '_formatNumber uses a precision of 3 for numbers over 1B'
    );
  });
});
