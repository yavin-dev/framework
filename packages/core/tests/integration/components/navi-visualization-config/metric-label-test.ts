import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import NaviVisualizationConfigMetricLabelComponent from 'navi-core/components/navi-visualization-config/metric-label';

let Template = hbs`
  <NaviVisualizationConfig::MetricLabel
    @response={{this.response}}
    @request={{this.request}}
    @options={{this.options}}
    @onUpdateConfig={{this.onUpdateConfig}}
  />`;

type ComponentArgs = NaviVisualizationConfigMetricLabelComponent['args'];

interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | visualization config/metric-label', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.options = {
      format: '$0,0[.]00',
      metricCid: 'cid_bubbles',
    };
    this.onUpdateConfig = () => null;
    this.request = store.createFragment('bard-request-v2/request', {
      columns: [
        {
          cid: 'cid_bubbles',
          type: 'metric',
          field: 'bubbles',
          parameters: {},
          alias: "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
          source: 'bardOne',
        },
      ],
      filters: [],
      sorts: [],
      requestVersion: '2.0',
      dataSource: 'bardOne',
      table: 'network',
    });
    this.response = { rows: [], meta: {} };
  });

  test('component renders', async function (assert) {
    assert.expect(2);

    await render(Template);

    assert
      .dom('.metric-label-config__label-input')
      .hasValue(
        "Glass Bottles of the ranch's finest pasteurized whole milk!!!!!!!",
        'Component correctly displays initial description'
      );

    assert
      .dom('.number-format-selector__format-input')
      .hasValue('$0,0[.]00', 'Component correctly displays initial format');
  });

  test('onUpdateConfig format input', async function (this: TestContext, assert) {
    assert.expect(1);

    this.onUpdateConfig = (result) => {
      assert.equal(result.format, 'foo', 'onUpdateConfig action is called by format input');
    };

    await render(Template);

    await fillIn('.number-format-selector__format-input', 'foo');
  });

  test('onUpdateConfig alias input', async function (this: TestContext, assert) {
    assert.expect(1);

    await render(Template);

    await fillIn('.metric-label-config__label-input', 'foo');

    assert.deepEqual(this.request.columns.firstObject?.alias, 'foo', 'The column alias is updated');
  });
});
