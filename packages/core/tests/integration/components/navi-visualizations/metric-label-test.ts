import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, getContext } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import MetricLabelVisualization from 'navi-core/components/navi-visualizations/metric-label';
import RequestFragment from 'navi-core/models/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import type { RowValue } from 'navi-data/serializers/facts/interface';

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
function _setModel(row: Record<string, RowValue>): void {
  const test = getContext() as TestContext;
  set(test.model.firstObject!.response, 'rows', [row]);
}
module('Integration | Component | navi-visualization/metric-label', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.options = {
      format: undefined,
      metricCid: 'cid',
    };
    this.model = A([
      {
        request: store.createFragment('request', {
          columns: [
            {
              cid: 'cid',
              type: 'metric',
              field: 'uniqueIdentifier',
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
    const MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata({ dataSourceName: 'bardOne' });
  });

  test('metric label renders correctly', async function (assert) {
    _setModel({ uniqueIdentifier: 30 });
    await render(TEMPLATE);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders correctly when model has multiple metrics', async function (assert) {
    _setModel({ uniqueIdentifier: 30, hp: 40 });
    await render(TEMPLATE);

    assert
      .dom('.metric-label-vis__description')
      .hasText('Magic Points (MP)', 'metric description is correctly displayed');

    assert.dom('.metric-label-vis__value').hasText('30', 'metric value is correctly displayed');
  });

  test('metric label renders formatted string when format not null', async function (this: TestContext, assert) {
    this.options = {
      format: '$ 0,0[.]00',
      metricCid: 'cid',
    };

    _setModel({ uniqueIdentifier: 1000000 });
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
