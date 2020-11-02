/* eslint-disable @typescript-eslint/camelcase */
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
//@ts-ignore
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { TestContext as Context } from 'ember-test-helpers';
import $ from 'jquery';
import { getTranslation } from 'navi-core/utils/chart';
import { cloneDeep } from 'lodash-es';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { Args as ComponentArgs } from 'navi-core/components/navi-visualizations/pie-chart';
import { VisualizationModel, VisualizationModelEntry } from 'navi-core/components/navi-visualizations/table';
import RequestFragment from 'navi-core/models/bard-request-v2/request';
import NaviFactResponse from 'navi-data/models/navi-fact-response';

const TEMPLATE = hbs`
  <NaviVisualizations::PieChart
    @model={{this.model}}
    @options={{this.options}}
  />`;

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
      source: 'bardOne'
    },
    {
      field: 'uniqueIdentifier',
      parameters: {},
      type: 'metric',
      cid: 'cid_uniqueIdentifier',
      source: 'bardOne'
    },
    {
      field: 'age',
      parameters: { field: 'desc' },
      type: 'dimension',
      cid: 'cid_age(field=desc)',
      source: 'bardOne'
    },
    {
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      type: 'timeDimension',
      cid: 'cid_network.dateTime(grain=day)',
      source: 'bardOne'
    }
  ],
  filters: [
    {
      field: 'network.dateTime',
      parameters: { grain: 'day' },
      type: 'timeDimension',
      operator: 'bet',
      values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
      source: 'bardOne'
    }
  ],
  sorts: [],
  requestVersion: '2.0',
  dataSource: 'bardOne'
};

let MetadataService: NaviMetadataService;

module('Integration | Component | pie chart', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    injectC3Enhancements();
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
          'revenue(currency=CAD)': 300
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': 'Under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639,
          'revenue(currency=USD)': 300,
          'revenue(currency=CAD)': 256
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639,
          'revenue(currency=USD)': 400,
          'revenue(currency=CAD)': 5236
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 500,
          'revenue(currency=CAD)': 4321
        },
        {
          'network.dateTime(grain=day)': '2015-12-14 00:00:00.000',
          'age(field=desc)': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 600,
          'revenue(currency=CAD)': 132
        }
      ]
    });
    Model = A([
      {
        request: Request,
        response: Response
      }
    ]);
    this.model = Model;
  });

  hooks.afterEach(function() {
    MetadataService['keg'].reset();
  });

  test('it renders for a dimension series', async function(assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' }
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' }
            }
          ]
        }
      }
    });
    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.chart-series-0 text')
      .hasText('13.02%', 'Percentage label shown on slice is formatted properly for `All Other`');

    assert
      .dom('.chart-series-1 text')
      .hasText('86.98%', 'Percentage label shown on slice is formatted properly for `Under 13`');
  });

  test('it renders for a metric series', async function(assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'metric',
        config: {}
      }
    });
    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.chart-series-0 text')
      .hasText('66.67%', 'Percentage label shown on slice is formatted properly for `Total Page Views`');

    assert
      .dom('.chart-series-1 text')
      .hasText('33.33%', 'Percentage label shown on slice is formatted properly for `Unique Identifier`');
  });

  test('metric label', async function(assert) {
    assert.expect(7);

    this.set('options', {
      series: {
        type: 'metric',
        config: {}
      }
    });

    await render(TEMPLATE);

    assert.dom('.c3-title').hasText('', 'The metric label is not visible for a series of type metric');

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_totalPageViews',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' }
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' }
            }
          ]
        }
      }
    });

    await render(TEMPLATE);

    assert.dom('.c3-title').hasText('Total Page Views', 'The metric name is displayed in the metric label correctly');

    //Calulate where the metric label should be relative to the pie chart
    let chartElm = find('.c3-chart-arcs');
    let xTranslate =
      getTranslation(chartElm?.getAttribute('transform') as string).x -
      (chartElm?.getBoundingClientRect()?.width || 0) / 2 -
      50;
    let yTranslate: number = ((find('svg')?.getAttribute('height') || 0) as number) / 2;

    assert.equal(
      Math.round(getTranslation(find('.c3-title')?.getAttribute('transform') as string).x),
      Math.round(xTranslate),
      'The metric name is in the correct X position on initial render'
    );

    assert.equal(
      Math.round(getTranslation(find('.c3-title')?.getAttribute('transform') as string).y),
      Math.round(yTranslate),
      'The metric name is in the correct Y position on initial render'
    );

    /*
     * Resize the parent element of the SVG that the pie chart is drawn in
     * This effectively moves the pie chart to the left
     */
    (find('.pie-chart-widget') as HTMLElement).style.maxWidth = '1000px';

    //Rerender with a new metric and new chart position
    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_uniqueIdentifier',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' }
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' }
            }
          ]
        }
      }
    });

    //Recalculate these after the chart is rerendered
    chartElm = find('.c3-chart-arcs');
    xTranslate =
      getTranslation(chartElm?.getAttribute('transform') as string).x -
      (chartElm?.getBoundingClientRect().width as number) / 2 -
      50;
    yTranslate =
      (($('svg')
        .css('height')
        .replace('px', '') as unknown) as number) / 2;

    assert.dom('.c3-title').hasText('Unique Identifiers', 'The metric label is updated after the metric is changed');

    assert.equal(
      Math.round(getTranslation(find('.c3-title')?.getAttribute('transform') as string).x),
      Math.round(xTranslate),
      'The metric name is in the correct X position after the pie chart moves'
    );

    assert.equal(
      Math.round(getTranslation(find('.c3-title')?.getAttribute('transform') as string).y),
      Math.round(yTranslate),
      'The metric name is in the correct Y position after the pie chart moves'
    );
  });

  test('parameterized metric renders correctly for dimension series', async function(assert) {
    const clonedModel = (cloneDeep(Model.firstObject) as unknown) as {
      request: RequestFragment;
      response: NaviFactResponse;
    };
    const newColumns = [
      ...RequestJSON.columns,
      {
        field: 'revenue',
        parameters: { currency: 'USD' },
        type: 'metric',
        cid: 'cid_revenue(currency=USD)',
        source: 'bardOne'
      }
    ];
    clonedModel.request = this.owner
      .lookup('service:store')
      .createFragment('bard-request-v2/request', { ...RequestJSON, columns: newColumns });
    this.set('model', A([clonedModel]));
    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metricCid: 'cid_revenue(currency=USD)',
          dimensions: [
            {
              name: 'All Other',
              values: { 'cid_age(field=desc)': 'All Other' }
            },
            {
              name: 'Under 13',
              values: { 'cid_age(field=desc)': 'Under 13' }
            }
          ]
        }
      }
    });

    await render(TEMPLATE);

    assert.dom('.c3-title').hasText('Revenue (USD)', 'The metric name is displayed in the metric label correctly');

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.chart-series-0 text')
      .hasText('40%', 'Percentage label shown on slice is formatted properly for `All Other`');

    assert
      .dom('.chart-series-1 text')
      .hasText('60%', 'Percentage label shown on slice is formatted properly for `Under 13`');
  });

  test('renders correctly with multi datasource', async function(assert) {
    assert.expect(1);
    MetadataService['keg'].reset();
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });
    const newColumns = [
      {
        field: 'inventory.dateTime',
        type: 'timeDimension',
        parameters: { grain: 'day' },
        cid: 'cid_inventory.dateTime(grain=day)',
        source: 'bardTwo'
      },
      {
        field: 'globallySold',
        parameters: {},
        type: 'metric',
        cid: 'cid_globallySold',
        source: 'bardTwo'
      },
      {
        field: 'container',
        parameters: { field: 'desc' },
        type: 'dimension',
        cid: 'cid_container(field=desc)',
        source: 'bardTwo'
      }
    ];
    const newFilters = [
      {
        field: 'inventory.dateTime',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        operator: 'bet',
        values: ['2015-12-14 00:00:00.000', '2015-12-15 00:00:00.000'],
        source: 'bardTwo'
      }
    ];
    const bardTwoModel = {
      request: this.owner.lookup('service:store').createFragment('bard-request-v2/request', {
        ...RequestJSON,
        columns: newColumns,
        filters: newFilters,
        dataSource: 'bardTwo'
      }),
      response: NaviFactResponse.create({
        rows: [
          {
            'inventory.dateTime(grain=day)': '2015-12-14 00:00:00.000',
            'container(field=desc)': 'Bag',
            globallySold: 155191081
          },
          {
            'inventory.dateTime(grain=day)': '2015-12-14 00:00:00.000',
            'container(field=desc)': 'Bank',
            globallySold: 55191081
          }
        ]
      })
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
              values: { 'cid_container(field=desc)': 'Bag' }
            },
            {
              name: 'Bank',
              values: { 'cid_container(field=desc)': 'Bank' }
            }
          ]
        }
      }
    });

    await render(TEMPLATE);

    assert
      .dom('.c3-title')
      .hasText('How many have sold worldwide', 'The metric name is displayed in the metric label correctly');
  });

  test('parameterized metric renders correctly for metric series', async function(assert) {
    assert.expect(4);
    const clonedModel = cloneDeep(Model.firstObject) as VisualizationModelEntry;
    const newColumns = [
      {
        field: 'network.dateTime',
        parameters: { grain: 'day' },
        type: 'timeDimension',
        cid: 'cid_network.dateTime(grain=day)'
      },
      {
        field: 'revenue',
        parameters: { currency: 'USD' },
        type: 'metric',
        cid: 'cid_revenue(currency=USD)'
      },
      {
        field: 'revenue',
        parameters: { currency: 'CAD' },
        type: 'metric',
        cid: 'cid_revenue(currency=CAD)'
      }
    ];
    clonedModel.request = this.owner
      .lookup('service:store')
      .createFragment('bard-request-v2/request', { ...RequestJSON, columns: newColumns });
    clonedModel.request.columns.forEach(c => (c.source = Request.dataSource));
    this.set('model', A([clonedModel]));

    this.set('options', {
      series: {
        type: 'metric',
        config: {}
      }
    });

    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.c3-chart-arc.chart-series-0 text')
      .hasText('40%', 'Percentage label shown on slice is formatted properly for `Revenue (USD)`');

    assert
      .dom('.c3-chart-arc.chart-series-1 text')
      .hasText('60%', 'Percentage label shown on slice is formatted properly for `Revenue (CAD)`');
  });

  test('cleanup tooltip', async function(assert) {
    assert.expect(2);

    const template = hbs`
    {{#if this.shouldRender}}
      <NaviVisualizations::PieChart
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
            { name: 'Under 13', values: { 'cid_age(field=desc)': 'Under 13' } }
          ]
        }
      }
    });
    const owner = this.owner;
    type OwnerWithRegistry = typeof owner & {
      __registry__: {
        registrations: string[];
      };
    };

    const findTooltipComponent = () =>
      Object.keys((owner as OwnerWithRegistry).__registry__.registrations).find(r =>
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
