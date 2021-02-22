import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, getContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import MetricLabelVisualization from 'navi-core/components/navi-visualizations/metric-label';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

const TEMPLATE = hbs`
<NaviVisualizations::MetricLabel
  @model={{this.model}}
  @options={{this.options}}
/>`;

type ComponentArgs = MetricLabelVisualization['args'];

interface TestContext extends Context, ComponentArgs {}

/**
 * Set the test context model property with a model object
 * @param context - test context
 * @param row - object containing row of data
 */
function _setModel(row: Record<string, unknown>): void {
  const test = getContext() as TestContext;
  set(test.model.firstObject!.response, 'rows', [row]);
}
module('Integration | Component | navi-visualization/metric-label', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.options = {
      format: undefined,
      metricCid: 'cid_magic',
    };
    this.model = A([
      {
        request: store.createFragment('bard-request-v2/request', {
          columns: [
            {
              cid: 'cid_magic',
              type: 'metric',
              field: 'magic',
              parameters: {},
              alias: 'Magic Points (MP)',
              source: 'bardOne',
            },
          ],
          filters: [],
          sorts: [],
          requestVersion: '2.0',
          dataSource: 'bardOne',
          table: 'network',
        }),
        response: NaviFactResponse.create({ rows: [] }),
      },
    ]);
  });

  test('metric label renders correctly', async function (assert) {
    assert.expect(2);

    _setModel({ magic: 30 });
    await render(TEMPLATE);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders correctly when model has multiple metrics', async function (assert) {
    assert.expect(2);

    _setModel({ magic: 30, hp: 40 });
    await render(TEMPLATE);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders formatted string when format not null', async function (this: TestContext, assert) {
    assert.expect(1);

    const request = this.model.firstObject?.request as RequestFragment;
    request.columns.clear();
    const rupees = request.addColumn({
      type: 'metric',
      field: 'rupees',
      parameters: {},
      alias: 'Rupees',
      source: 'bardOne',
    });

    this.options = {
      format: '$ 0,0[.]00',
      metricCid: rupees.cid,
    };

    _setModel({ rupees: 1000000 });
    await render(TEMPLATE);
    assert.dom('.metric-label-vis__value').hasText('$ 1,000,000', 'metric value is formatted correctly');
  });

  test('metric label - missing metric', async function (this: TestContext, assert) {
    const request = this.model.firstObject?.request as RequestFragment;
    request.columns.clear();
    this.options = {
      format: '$ 0,0[.]00',
      metricCid: undefined,
    };

    _setModel({ rupees: 1000000 });
    await render(TEMPLATE);
    assert.dom('.metric-label-vis__value').hasNoText('metric value is blank when metric is missing');
  });
});
