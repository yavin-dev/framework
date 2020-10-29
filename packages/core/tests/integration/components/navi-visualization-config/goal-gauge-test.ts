import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, blur, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import NaviVisualizationConfigGoalGaugeComponent from 'navi-core/components/navi-visualization-config/goal-gauge';

const Template = hbs`
  <NaviVisualizationConfig::GoalGauge
    @response={{this.response}}
    @request={{this.request}}
    @options={{this.options}}
    @onUpdateConfig={{this.onUpdateConfig}}
  />`;

type ComponentArgs = NaviVisualizationConfigGoalGaugeComponent['args'];

interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | visualization config/goal gauge', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;

    this.options = {
      baselineValue: 200,
      goalValue: 0,
      metricCid: 'cid_pageViews'
    };
    this.onUpdateConfig = () => null;
    this.request = store.createFragment('bard-request-v2/request', {
      columns: [
        {
          cid: 'cid_pageViews',
          type: 'metric',
          field: 'pageViews',
          parameters: {},
          alias: 'Number of pageViews',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network'
    });
    this.response = { rows: [{ pageViews: 32 }], meta: {} };
  });

  test('it renders', async function(this: TestContext, assert) {
    await render(hbs`<NaviVisualizationConfig::GoalGauge/>`);

    const headers = findAll('.goal-gauge-config__section-header').map(el => el?.textContent?.trim());
    assert.deepEqual(headers, ['Label', 'Baseline', 'Goal'], 'headers are displayed for goal gauge config');
  });

  test('onUpdateConfig baselineValue input', async function(this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateConfig', (result: { baselineValue: string | number }) => {
      assert.equal(result.baselineValue, 1, 'onUpdateConfig action is called by baseline input');
    });

    await render(Template);
    await fillIn('.goal-gauge-config__baseline-input', '1');
    await blur('.goal-gauge-config__baseline-input');
  });

  test('onUpdateConfig goalValue input', async function(this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateConfig', (result: { goalValue: string | number }) => {
      assert.equal(result.goalValue, 10, 'onUpdateConfig action is called by goal input');
    });

    await render(Template);

    await fillIn('.goal-gauge-config__goal-input', '10');
    await blur('.goal-gauge-config__goal-input');
  });

  test('onUpdateConfig goal gauge label input', async function(this: TestContext, assert) {
    assert.expect(1);

    await render(Template);

    await fillIn('.goal-gauge-config__label-input', 'bottles');
    await blur('.goal-gauge-config__label-input');
    assert.equal(this.request.metricColumns[0].alias, 'bottles', 'onUpdateConfig action is called by label input');
  });
});
