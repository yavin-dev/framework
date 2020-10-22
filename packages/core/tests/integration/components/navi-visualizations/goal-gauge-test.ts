import { A as arr } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { TestContext as Context } from 'ember-test-helpers';
import StoreService from '@ember-data/store';
import GoalGaugeVisualization from 'navi-core/components/navi-visualizations/goal-gauge';

const TEMPLATE = hbs`
<NaviVisualizations::GoalGauge
  @model={{this.model}}
  @options={{this.options}}
/>`;

type ComponentArgs = GoalGaugeVisualization['args'];

interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | navi-visualization/goal gauge ', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function(this: TestContext) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.options = { metricCid: 'pageViews', baselineValue: 290000000, goalValue: 310000000 };
    let request = store.createFragment('bard-request-v2/request', {
      table: null,
      columns: [
        {
          cid: 'pageViews',
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
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });
    this.model = arr([
      {
        request,
        response: { rows: [{ pageViews: 3030000000 }], meta: {} }
      }
    ]);
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
    assert.expect(1);
    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model.firstObject.request',
      store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [
          {
            cid: 'available',
            type: 'metric',
            field: 'available',
            parameters: {},
            alias: 'How many are available',
            source: 'bardTwo'
          }
        ],
        filters: [],
        sorts: [],
        limit: null,
        dataSource: 'bardOne',
        requestVersion: '2.0'
      })
    );

    this.set('model.firstObject.response', { rows: [{ available: 3030000000 }], meta: {} });
    this.set('options', { metricCid: 'available', baselineValue: 290000000, goalValue: 310000000 });

    await render(TEMPLATE);

    assert.dom('.metric-title').hasText('How many are available', 'the default metric title is correctly displayed');
  });

  test('goal-gauge renders correctly with unit', async function(this: TestContext, assert) {
    assert.expect(6);

    this.set('model.firstObject.response', { rows: [{ pageViews: 75 }], meta: {} });
    //@ts-expect-error
    this.set('options', { metricCid: 'pageViews', baselineValue: 50, goalValue: 100, unit: '%' });
    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('75%', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('50%', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('100%', 'max gauge label is correctly displayed');

    assert.dom('.goal-title').hasText('100% Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge renders correctly with prefix', async function(assert) {
    assert.expect(6);

    this.set('model.firstObject.response', { rows: [{ pageViews: 75 }], meta: {} });
    //@ts-expect-error
    this.set('options', { metricCid: 'pageViews', baselineValue: 50, goalValue: 100, prefix: '$' });
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
    this.set(
      'model.firstObject.request',
      store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [
          {
            cid: 'm1',
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
      })
    );

    this.set('model.firstObject.response.rows', [{ m1: 150 }]);
    this.options = { metricCid: 'm1', baselineValue: 100, goalValue: 200 };
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.pos').length, 'pos class is added when actualValue is above baselineValue');

    this.set('model.firstObject.response.rows', [{ m1: 50 }]);
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue is below baselineValue');

    this.set('model.firstObject.response.rows', [{ m1: 100 }]);
    await render(TEMPLATE);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue equals baselineValue');
  });

  test('goal-guage with parameterized metric', async function(assert) {
    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model',
      arr([
        {
          response: {
            rows: [
              {
                'revenue(currency=USD)': '300'
              }
            ]
          },
          request: store.createFragment('bard-request-v2/request', {
            table: null,
            columns: [
              {
                field: 'revenue',
                parameters: {
                  currency: 'USD'
                },
                cid: 'revenue',
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
          })
        }
      ])
    );
    this.set('options', {
      baselineValue: 200,
      goalValue: 500,
      metricCid: 'revenue'
    });

    await render(TEMPLATE);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('300', 'value title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('200', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('500', 'max gauge label is correctly displayed');

    assert.dom('.metric-title').hasText('Revenue (USD)', 'parameterized metric title is correctly displayed');
  });

  test('goal-gauge value & min/max precision', async function(assert) {
    assert.expect(6);

    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model.firstObject.request',
      store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [
          {
            cid: 'm1',
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
      })
    );
    this.set('model.firstObject.response.rows', [{ m1: 1234567 }]);
    this.set('options', {
      baselineValue: 1234567,
      goalValue: 1234567,
      metricCid: 'm1'
    });

    await render(TEMPLATE);

    assert.dom('.value-title').hasText('1.23M', 'value title has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('1.23M', 'min gauge label has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('1.23M', 'max gauge label has a precision of 2 when under 1B');

    this.set('model.firstObject.response.rows', [{ m1: 9123456789 }]);
    this.set('options', {
      baselineValue: 9123456789,
      goalValue: 9123456789,
      metricCid: 'm1'
    });

    await render(TEMPLATE);

    assert.dom('.value-title').hasText('9.123B', 'value title has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('9.123B', 'min gauge label has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('9.123B', 'max gauge label has a precision of 3 when over 1B');
  });

  test('goal-gauge renders custom metric title', async function(assert) {
    assert.expect(1);

    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model.firstObject.request',
      store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [
          {
            cid: 'm1',
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
      })
    );
    this.set('model.firstObject.response.rows', [{ m1: 75 }]);
    this.set('options', {
      baselineValue: 50,
      goalValue: 100,
      metricCid: 'm1'
    });
    await render(TEMPLATE);

    assert.dom('.metric-title').hasText('A real good metric', 'custom metric title is correctly displayed');
  });

  test('cleanup', async function(assert) {
    assert.expect(2);

    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model.firstObject.request',
      store.createFragment('bard-request-v2/request', {
        table: null,
        columns: [
          {
            cid: 'm1',
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
      })
    );
    this.set('model.firstObject.response.rows', [{ m1: 75 }]);
    this.set('options', {
      baselineValue: 50,
      goalValue: 100,
      metricCid: 'm1'
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
