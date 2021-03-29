/* eslint-disable @typescript-eslint/camelcase */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext as Context } from 'ember-test-helpers';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { Args as ComponentArgs } from 'navi-core/components/navi-visualizations/pie-chart';
import { VisualizationModel } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import ColumnFragment from 'navi-core/models/bard-request-v2/fragments/column';

const TEMPLATE = hbs`
<div style="width:400px; height:400px;">
  <NaviVisualizations::Apex::PieChart
    @model={{this.model}}
    @options={{this.options}}
  />
</div>
`;

interface TestContext extends Context, ComponentArgs {}

let Model: VisualizationModel, Request: RequestFragment, Response: NaviFactResponse;
const RequestJSON = {
  table: 'network',
  columns: [
    {
      field: 'totalPageViews',
      parameters: {},
      type: 'metric',
      cid: 'cid_totalPageViews',
      source: 'bardOne',
    },
    {
      field: 'uniqueIdentifier',
      parameters: {},
      type: 'metric',
      cid: 'cid_uniqueIdentifier',
      source: 'bardOne',
    },
    {
      field: 'age',
      parameters: { field: 'desc' },
      type: 'dimension',
      cid: 'cid_age(field=desc)',
      source: 'bardOne',
    },
    {
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      type: 'timeDimension',
      cid: 'cid_network.dateTime(grain=day)',
      source: 'bardOne',
    },
  ],
  filters: [
    {
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      type: 'timeDimension',
      operator: 'bet',
      values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
      source: 'bardOne',
    },
  ],
  sorts: [],
  requestVersion: '2.0',
  dataSource: 'bardOne',
};

let MetadataService: NaviMetadataService;

module('Integration | Component | Apex | pie chart', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata();
    Request = this.owner.lookup('service:store').createFragment('bard-request-v2/request', RequestJSON);
    Response = NaviFactResponse.create({
      rows: [
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': 'All Other',
          uniqueIdentifier: 155191081,
          totalPageViews: 310382162,
          'revenue(currency=USD)': 200,
          'revenue(currency=CAD)': 300,
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': 'Under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639,
          'revenue(currency=USD)': 300,
          'revenue(currency=CAD)': 256,
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639,
          'revenue(currency=USD)': 400,
          'revenue(currency=CAD)': 5236,
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 500,
          'revenue(currency=CAD)': 4321,
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 600,
          'revenue(currency=CAD)': 132,
        },
      ],
    });
    Model = A([
      {
        request: Request,
        response: Response,
      },
    ]);
    this.model = Model;
  });

  hooks.afterEach(function () {
    MetadataService['keg'].reset();
  });

  test('it renders for a dimension series', async function (assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' },
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' },
            },
          ],
        },
      },
    });
    await render(TEMPLATE);

    assert.dom('.ember-apex-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.apexcharts-pie-area').exists({ count: 2 }, 'Two pie slices are present on the chart');

    const [label1, label2] = findAll('.apexcharts-pie-label');
    assert.dom(label1).hasText('13.02%', 'Percentage label shown on slice is formatted properly for `All Other`');

    assert.dom(label2).hasText('86.98%', 'Percentage label shown on slice is formatted properly for `Under 13`');
  });

  test('it renders for a metric series', async function (assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'metric',
        config: {},
      },
    });
    await render(TEMPLATE);

    assert.dom('.ember-apex-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.apexcharts-pie-area').exists({ count: 2 }, 'Two pie slices are present on the chart');

    const [label1, label2] = findAll('.apexcharts-pie-label');
    assert
      .dom(label1)
      .hasText('66.67%', 'Percentage label shown on slice is formatted properly for `Total Page Views`');

    assert
      .dom(label2)
      .hasText('33.33%', 'Percentage label shown on slice is formatted properly for `Unique Identifier`');
  });

  test('metric label', async function (assert) {
    assert.expect(3);

    this.set('options', {
      series: {
        type: 'metric',
        config: {},
      },
    });

    await render(TEMPLATE);

    assert.dom('.apexcharts-title-text').doesNotExist('Metric series of does not show a title');

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' },
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' },
            },
          ],
        },
      },
    });

    await render(TEMPLATE);

    assert
      .dom('.apexcharts-title-text')
      .hasText('Total Page Views', 'The metric name is displayed in the metric label correctly');

    //Rerender with a new metric and new chart position
    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_uniqueIdentifier',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' },
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' },
            },
          ],
        },
      },
    });

    assert
      .dom('.apexcharts-title-text')
      .hasText('Unique Identifiers', 'The metric label is updated after the metric is changed');
  });

  test('metric label - column alias', async function (this: TestContext, assert) {
    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' },
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' },
            },
          ],
        },
      },
    });

    await render(TEMPLATE);
    assert
      .dom('.apexcharts-title-text')
      .hasText('Total Page Views', 'The metric name is displayed in the metric label correctly');

    const metricColumn = this.model.firstObject?.request.columns.firstObject as ColumnFragment;

    // set alias
    const alias = 'Metric Alias';
    metricColumn.set('alias', alias);
    await settled();
    assert.dom('.apexcharts-title-text').hasText(alias, 'The metric alias is rendered on update');

    // unset alias
    metricColumn.set('alias', undefined);
    await settled();
    assert.dom('.apexcharts-title-text').hasText('Total Page Views', 'The original metric name is restored on update');
  });

  test('renders correctly with multi datasource', async function (assert) {
    assert.expect(1);
    MetadataService['keg'].reset();
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    const newColumns = [
      {
        field: 'inventory.dateTime',
        type: 'timeDimension',
        parameters: { grain: 'day' },
        cid: 'cid_inventory.dateTime(grain=day)',
        source: 'bardTwo',
      },
      {
        field: 'globallySold',
        parameters: {},
        type: 'metric',
        cid: 'cid_globallySold',
        source: 'bardTwo',
      },
      {
        field: 'container',
        parameters: { field: 'desc' },
        type: 'dimension',
        cid: 'cid_container(field=desc)',
        source: 'bardTwo',
      },
    ];
    const newFilters = [
      {
        field: 'inventory.dateTime',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        operator: 'bet',
        values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
        source: 'bardTwo',
      },
    ];
    const bardTwoModel = {
      request: this.owner.lookup('service:store').createFragment('bard-request-v2/request', {
        ...RequestJSON,
        columns: newColumns,
        filters: newFilters,
        dataSource: 'bardTwo',
      }),
      response: NaviFactResponse.create({
        rows: [
          {
            'inventory.dateTime(grain=day)': '2015-12-14 00:00:00.000',
            'container(field=desc)': 'Bag',
            globallySold: 155191081,
          },
          {
            'inventory.dateTime(grain=day)': '2015-12-14 00:00:00.000',
            'container(field=desc)': 'Bank',
            globallySold: 55191081,
          },
        ],
      }),
    };
    this.set('model', A([bardTwoModel]));

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_globallySold',
          dimensions: [
            {
              name: 'Bag',
              values: { 'cid_container(field=desc)': 'Bag' },
            },
            {
              name: 'Bank',
              values: { 'cid_container(field=desc)': 'Bank' },
            },
          ],
        },
      },
    });

    await render(TEMPLATE);

    assert
      .dom('.apexcharts-title-text')
      .hasText('How many have sold worldwide', 'The metric name is displayed in the metric label correctly');
  });

  test('apex chart renders correct legent', async function (assert) {
    assert.expect(3);

    this.set('options', {
      series: {
        type: 'metric',
        config: {},
      },
    });
    await render(TEMPLATE);
    assert.dom('.apexcharts-legend-series').exists({ count: 2 }, 'all slice data renders in legend');

    assert.dom('.apexcharts-legend-text').hasAttribute('data:default-text');
    assert.deepEqual(
      findAll('.apexcharts-legend-text').map((el) => el.textContent?.trim()),
      ['Total Page Views', 'Unique Identifiers'],
      'legend renders with correct labels for all slices'
    );
  });

  test('apex chart renders correct series values', async function (assert) {
    assert.expect(3);

    this.set('options', {
      series: {
        type: 'metric',
        config: {},
      },
    });
    await render(TEMPLATE);
    assert.dom('.apexcharts-pie-series').exists({ count: 2 }, 'all slices of pie chart render');

    assert.deepEqual(
      findAll('.apexcharts-datalabels').map((el) => el.textContent?.trim()),
      ['66.67%', '33.33%'],
      'percents are rendered correctly'
    );
    assert.deepEqual(
      findAll('.apexcharts-pie-area').map((el) => el.getAttribute('data:value')),
      ['310382162', '155191081'],
      'percents are rendered correctly'
    );
  });

  test('cleanup tooltip', async function (assert) {
    assert.expect(2);

    const template = hbs`
    {{#if this.shouldRender}}
      <NaviVisualizations::Apex::PieChart
        @model={{this.model}}
        @options={{this.options}}
      />
    {{/if}}`;

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            { name: 'All Other', values: { 'cid_age(field=desc)': 'All Other' } },
            { name: 'Under 13', values: { 'cid_age(field=desc)': 'Under 13' } },
          ],
        },
      },
    });
    const owner = this.owner;
    type OwnerWithRegistry = typeof owner & {
      __registry__: {
        registrations: string[];
      };
    };

    const findTooltipComponent = () =>
      Object.keys((owner as OwnerWithRegistry).__registry__.registrations).find((r) =>
        r.startsWith('component:pie-chart-tooltip-')
      );

    this.set('model', Model);
    this.set('shouldRender', true);
    await render(template);

    assert.ok(findTooltipComponent(), 'tooltip component is registered when chart is created');

    this.set('shouldRender', false);

    assert.notOk(findTooltipComponent(), 'tooltip component is unregistered when chart is destroyed');
  });
});
