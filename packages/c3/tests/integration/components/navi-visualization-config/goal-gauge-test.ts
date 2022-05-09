import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import NaviVisualizationConfigGoalGaugeComponent from '@yavin/c3/components/navi-visualization-config/goal-gauge';

const TEMPLATE = hbs`
  <NaviVisualizationConfig::GoalGauge
    @response={{this.response}}
    @request={{this.request}}
    @options={{this.options}}
    @onUpdateConfig={{this.onUpdateConfig}}
  />`;

type ComponentArgs = NaviVisualizationConfigGoalGaugeComponent['args'];

interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | visualization config/goal gauge', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.options = {
      baselineValue: 200,
      goalValue: 0,
      metricCid: 'cid_pageViews',
    };
    this.onUpdateConfig = () => null;
    this.request = store.createFragment('request', {
      columns: [
        {
          cid: 'cid_pageViews',
          type: 'metric',
          field: 'pageViews',
          parameters: {},
          alias: 'Number of pageViews',
          source: 'bardOne',
        },
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network',
    });
    this.response = { rows: [{ pageViews: 32 }], meta: {} };
  });

  test('it renders', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    const headers = findAll('.goal-gauge-config__section-header').map((el) => el?.textContent?.trim());
    assert.deepEqual(headers, ['Goal Label', 'Baseline', 'Goal'], 'headers are displayed for goal gauge config');
  });

  test('onUpdateConfig baselineValue input', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateConfig', (result: { baselineValue: number }) => {
      assert.strictEqual(result.baselineValue, 1, 'onUpdateConfig action is called by baseline input');
    });

    await render(TEMPLATE);
    await fillIn('.goal-gauge-config__baseline-input', '1');
  });

  test('onUpdateConfig goalValue input', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateConfig', (result: { goalValue: number }) => {
      assert.strictEqual(result.goalValue, 10, 'onUpdateConfig action is called by goal input');
    });

    await render(TEMPLATE);

    await fillIn('.goal-gauge-config__goal-input', '10');
  });

  test('onUpdateConfig goal gauge label input', async function (this: TestContext, assert) {
    assert.expect(1);

    await render(TEMPLATE);

    await fillIn('.goal-gauge-config__label-input', 'bottles');
    assert.strictEqual(
      this.request.metricColumns[0].alias,
      'bottles',
      'onUpdateConfig action is called by label input'
    );
  });
});
