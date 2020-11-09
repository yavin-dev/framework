import { A as arr } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import GoalGaugeVisualization from 'navi-core/components/navi-visualizations/goal-gauge';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
<NaviVisualizations::GoalGauge
  @model={{this.model}}
  @options={{this.options}}
/>`;

type ComponentArgs = GoalGaugeVisualization['args'];

interface TestContext extends Context, ComponentArgs {
  request: RequestFragment;
}

module('Integration | Component | navi-visualization/goal gauge ', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    const MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata({ dataSourceName: 'bardOne' });
    this.options = { metricCid: 'cid_pageViews', baselineValue: 290000000, goalValue: 310000000 };
    this.request = store.createFragment('bard-request-v2/request', {
      table: 'inventory',
      columns: [
        {
          cid: 'cid_pageViews',
          type: 'metric',
          field: 'pageViews',
          parameters: {},
          alias: 'Page Views',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardTwo',
      requestVersion: '2.0'
    });
    this.set(
      'model',
      arr([
        { request: this.request, response: NaviFactResponse.create({ rows: [{ pageViews: 3030000000 }], meta: {} }) }
      ])
    );
  });

  test('goal-gauge renders correctly', async function(this: TestContext, assert) {
    assert.expect(6);

    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('3.03B', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'the default metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('290M', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('310M', 'max gauge label is correctly displayed');

    assert.dom('.goal-title').hasText('310M Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge renders correctly with multi datasource', async function(this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    const MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    this.set('options', { metricCid: 'cid_available', baselineValue: 290000000, goalValue: 310000000 });

    this.request = store.createFragment('bard-request-v2/request', {
      table: 'inventory',
      columns: [
        {
          cid: 'cid_available',
          type: 'metric',
          field: 'available',
          parameters: {},
          alias: '',
          source: 'bardTwo'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardTwo',
      requestVersion: '2.0'
    });

    this.set(
      'model',
      arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ available: 3030000000 }] }) }])
    );
    await render(TEMPLATE);
    assert.dom('.metric-title').hasText('How many are available', 'the aliased metric title is correctly displayed');

    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'cid_available',
          type: 'metric',
          field: 'available',
          parameters: {},
          alias: 'Number Available',
          source: 'bardTwo'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });

    this.set(
      'model',
      arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ available: 3030000000 }] }) }])
    );
    await render(TEMPLATE);

    assert.dom('.metric-title').hasText('Number Available', 'the aliased metric title is correctly displayed');
  });

  test('goal-gauge renders correctly with unit', async function(this: TestContext, assert) {
    assert.expect(6);

    this.set(
      'model',
      arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ pageViews: 75 }] }) }])
    );
    this.set('options', { metricCid: 'cid_pageViews', baselineValue: 50, goalValue: 100, unit: '%' });
    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('75%', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('50%', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('100%', 'max gauge label is correctly displayed');

    assert.dom('.goal-title').hasText('100% Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge renders correctly with prefix', async function(this: TestContext, assert) {
    this.set(
      'model',
      arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ pageViews: 75 }] }) }])
    );
    this.set('options', { metricCid: 'cid_pageViews', baselineValue: 50, goalValue: 100, prefix: '$' });
    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('$75', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('$50', 'min gauge label is correctly displayed with prefix');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('$100', 'max gauge label is correctly displayed with prefix');

    assert.dom('.goal-title').hasText('$100 Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge title class is based on actualValue vs baselineValue', async function(this: TestContext, assert) {
    assert.expect(3);

    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'cid_m1',
          type: 'metric',
          field: 'm1',
          parameters: {},
          alias: '',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });

    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 150 }] }) }]));
    this.options = { metricCid: 'cid_m1', baselineValue: 100, goalValue: 200 };
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.pos').length, 'pos class is added when actualValue is above baselineValue');

    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 50 }] }) }]));
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue is below baselineValue');

    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 100 }] }) }]));
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue equals baselineValue');
  });

  test('goal-guage with parameterized metric', async function(this: TestContext, assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          field: 'revenue',
          parameters: {
            currency: 'USD'
          },
          cid: 'cid_revenue',
          type: 'metric',
          alias: 'Revenue (USD)',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
    this.set('options', {
      baselineValue: 200,
      goalValue: 500,
      metricCid: 'cid_revenue'
    });
    this.set(
      'model',
      arr([
        { request: this.request, response: NaviFactResponse.create({ rows: [{ 'revenue(currency=USD)': '300' }] }) }
      ])
    );

    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('300', 'value title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('200', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('500', 'max gauge label is correctly displayed');

    assert.dom('.metric-title').hasText('Revenue (USD)', 'parameterized metric title is correctly displayed');
  });

  test('goal-gauge value & min/max precision', async function(this: TestContext, assert) {
    assert.expect(6);

    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'cid_m1',
          type: 'metric',
          field: 'm1',
          parameters: {},
          alias: '',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
    this.set('options', {
      baselineValue: 1234567,
      goalValue: 1234567,
      metricCid: 'cid_m1'
    });
    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 1234567 }] }) }]));

    await render(TEMPLATE);

    assert.dom('.value-title').hasText('1.23M', 'value title has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('1.23M', 'min gauge label has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('1.23M', 'max gauge label has a precision of 2 when under 1B');

    this.set('options', {
      baselineValue: 9123456789,
      goalValue: 9123456789,
      metricCid: 'cid_m1'
    });
    this.set(
      'model',
      arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 9123456789 }] }) }])
    );
    await render(TEMPLATE);

    assert.dom('.value-title').hasText('9.123B', 'value title has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('9.123B', 'min gauge label has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('9.123B', 'max gauge label has a precision of 3 when over 1B');
  });

  test('goal-gauge renders custom metric title', async function(this: TestContext, assert) {
    assert.expect(1);

    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'cid_m1',
          type: 'metric',
          field: 'm1',
          parameters: {},
          alias: 'A real good metric',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 75 }] }) }]));
    this.set('options', {
      baselineValue: 50,
      goalValue: 100,
      metricCid: 'cid_m1'
    });
    await render(TEMPLATE);

    assert.dom('.metric-title').hasText('A real good metric', 'custom metric title is correctly displayed');
  });

  test('cleanup', async function(this: TestContext, assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store') as StoreService;
    this.request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'cid_m1',
          type: 'metric',
          field: 'm1',
          parameters: {},
          alias: 'A real great metric',
          source: 'bardOne'
        }
      ],
      filters: [],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
    this.set('model', arr([{ request: this.request, response: NaviFactResponse.create({ rows: [{ m1: 75 }] }) }]));
    this.set('options', {
      baselineValue: 50,
      goalValue: 100,
      metricCid: 'cid_m1'
    });

    await render(TEMPLATE);

    assert
      .dom('text.c3-chart-arcs-title > tspan')
      .exists({ count: 3 }, 'on initial render, 3 title tspans are present');

    assert
      .dom('text.c3-chart-arcs-title > tspan')
      .exists({ count: 3 }, 'on rerender render, 3 title tspans are present');
  });
});
