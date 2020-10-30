import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Promise } from 'rsvp';
import { TestContext } from 'ember-test-helpers';
import { A } from '@ember/array';
import { set } from '@ember/object';
import { run } from '@ember/runloop';
import moment from 'moment';
import { merge } from 'lodash-es';
import { GROUP } from 'navi-core/chart-builders/date-time';
import NaviMetadata from 'navi-data/services/navi-metadata';
import { createGlimmerClass, createGlimmerComponent } from 'navi-core/test-support';
import LineChart from 'navi-core/components/navi-visualizations/line-chart';
import { C3Row } from 'navi-core/chart-builders/base';
import NaviFactResponse from 'navi-data/models/navi-fact-response';
import StoreService from '@ember-data/store';
import { buildTestRequest } from '../../../helpers/request';
import { LineChartConfig } from 'navi-core/models/line-chart';

/*eslint max-len: ["error", { "code": 250 }]*/

let Store: StoreService;

module('Unit | Component | line chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    Store = this.owner.lookup('service:store') as StoreService;
    const naviMetadata = this.owner.lookup('service:navi-metadata') as NaviMetadata;
    await naviMetadata.loadMetadata();
  });

  test('dataConfig', function(assert) {
    const response = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', uniqueIdentifier: 172933788, totalPageViews: 3669828357 },
        { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', uniqueIdentifier: 183206656, totalPageViews: 4088487125 },
        { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', uniqueIdentifier: 183380921, totalPageViews: 4024700302 },
        { 'network.dateTime(grain=day)': '2016-06-02 00:00:00.000', uniqueIdentifier: 180559793, totalPageViews: 3950276031 },
        { 'network.dateTime(grain=day)': '2016-06-03 00:00:00.000', uniqueIdentifier: 172724594, totalPageViews: 3697156058 }
      ]
    });
    const request = Store.createFragment('bard-request-v2/request', {
      table: 'network',
      columns: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          alias: null,
          source: 'bardOne'
        },
        { type: 'metric', field: 'totalPageViews', parameters: {}, alias: null, source: 'bardOne' }
      ],
      filters: [
        {
          type: 'timeDimension',
          field: 'network.dateTime',
          parameters: { grain: 'day' },
          alias: null,
          operator: 'bet',
          values: ['2016-05-30 00:00:00.000', '2016-06-04 00:00:00.000'],
          source: 'bardOne'
        }
      ],
      sorts: [],
      limit: null,
      dataSource: 'bardOne',
      requestVersion: '2.0'
    });

    let options = {
      style: { stacked: false },
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    } as LineChart['args']['options'];

    const args: LineChart['args'] = {
      model: A([{ request, response }]),
      options
    };
    let component = createGlimmerComponent('component:navi-visualizations/line-chart', args) as LineChart;

    let expectedData = (response.rows.map(row => {
      const date = row['network.dateTime(grain=day)'] as string;
      return {
        x: {
          rawValue: date,
          displayValue: moment(date).format('MMM D')
        },
        'series.0': row.totalPageViews
      };
    }) as unknown) as C3Row[];

    assert.deepEqual(
      component.dataConfig.data.json,
      expectedData,
      'Data config contains json property with values for each x value and each series'
    );

    assert.deepEqual(
      component.dataConfig.data.names,
      { 'series.0': 'Total Page Views' },
      'Data config contains names property mapping series to display name'
    );

    assert.deepEqual(component.dataConfig.data.groups, [], 'Data config groups is empty when chart is not stacked');

    options = {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    };

    set(component.args, 'options', options);
    component.args.model.firstObject?.request.addColumn({
      type: 'metric',
      field: 'uniqueIdentifier',
      parameters: {},
      source: 'bardOne'
    });

    expectedData = (response.rows.map(row => {
      const date = row['network.dateTime(grain=day)'] as string;
      return {
        x: {
          rawValue: date,
          displayValue: moment(date).format('MMM D')
        },
        'series.0': row.totalPageViews,
        'series.1': row.uniqueIdentifier
      };
    }) as unknown) as C3Row[];

    assert.deepEqual(component.dataConfig.data.json, expectedData, 'Data config updates with series options');

    assert.deepEqual(
      component.dataConfig.data.names,
      { 'series.0': 'Total Page Views', 'series.1': 'Unique Identifiers' },
      'Data config contains names property mapping series to display name'
    );

    set(component.args, 'options', Object.assign({}, options, { style: { stacked: true } }));

    assert.deepEqual(
      component.dataConfig.data.groups,
      [['series.0', 'series.1']],
      'Data config groups is array of series keys when chart is stacked'
    );
  });

  test('dataSelectionConfig', function(assert) {
    assert.expect(2);

    const insightsDataPromise = new Promise(resolve => {
      resolve(
        A([
          {
            index: 1,
            actual: 12,
            predicted: 172724594.12345,
            standardDeviation: 123.123456
          }
        ])
      );
    });
    const args: LineChart['args'] = {
      //@ts-expect-error
      model: A([{}, insightsDataPromise])
    };
    const component = createGlimmerComponent('component:navi-visualizations/line-chart', args) as LineChart;

    assert.ok(component.dataSelectionConfig.dataSelection?.then, 'Data selection config returns a promise as expected');

    component.dataSelectionConfig.dataSelection?.then(insightsData => {
      assert.deepEqual(
        insightsData.mapBy('index'),
        [1],
        'dataSelectionConfig promise resovles to an array of indices to highlight data points'
      );
    });
  });

  test('config', function(assert) {
    assert.expect(4);

    class TestLineChart extends LineChart {
      // dataConfig has a separate test
      //@ts-expect-error
      get dataConfig() {
        return {};
      }
    }

    const component = createGlimmerClass(TestLineChart, {
      model: A([
        {
          request: buildTestRequest([{ cid: 'cid_totalPageViews', field: 'totalPageViews' }]),
          response: NaviFactResponse.create()
        }
      ])
    }) as TestLineChart;

    const defaultConfig = {
      style: {
        curve: 'line',
        area: false,
        stacked: false
      },
      axis: {
        x: {
          type: 'category',
          categories: [],
          tick: {
            culling: true,
            multiline: false
          }
        },
        y: {
          label: {
            position: 'outer-middle'
          },
          series: {
            type: 'metric',
            config: {}
          },
          tick: component.config.axis.y.tick
        }
      },
      grid: {
        y: { show: true }
      },
      point: {
        r: 0,
        focus: {
          expand: {
            r: 4
          }
        }
      },
      tooltip: component.chartTooltip
    };

    assert.deepEqual(component.config, defaultConfig, 'Component has a defaultConfig');

    let newGrid = {
      x: { show: false }
    };

    //@ts-expect-error
    set(component.args, 'options', { grid: newGrid });

    assert.deepEqual(
      component.config,
      merge({}, defaultConfig, {
        grid: newGrid,
        tooltip: component.chartTooltip
      }),
      'Component merges the defined options with the default config'
    );

    /* == Test Y Axis Label on Non-metric charts == */
    let dimensionChartType: LineChartConfig['metadata'] = {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metricCid: 'cid_totalPageViews',
              dimensions: []
            }
          }
        }
      }
    };

    //set chart type to be dimension
    set(component.args, 'options', dimensionChartType);

    let yAxislabelOptions = {
      axis: {
        y: {
          label: {
            text: 'Total Page Views',
            position: 'outer-middle'
          }
        }
      }
    };

    assert.deepEqual(
      component.config,
      merge({}, defaultConfig, dimensionChartType, yAxislabelOptions, {
        tooltip: component.chartTooltip
      }),
      'Component displays y-axis label for a non-metric chart'
    );

    //set the chart type to be metric
    set(component.args, 'options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    assert.deepEqual(
      component.config.axis.y.label,
      { position: 'outer-middle' },
      'Component does not display y-axis label for a metric chart'
    );
  });

  test('single data point', function(assert) {
    assert.expect(2);

    const model = A([
      {
        request: buildTestRequest(
          [{ field: 'uniqueIdentifier' }],
          [],
          { start: 'P1D', end: '2016-05-31 00:00:00.000' },
          'day'
        ),
        response: NaviFactResponse.create({
          rows: [
            {
              'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              uniqueIdentifier: 172933788,
              totalPageViews: 3669828357
            }
          ]
        })
      }
    ]);
    const component = createGlimmerComponent('component:navi-visualizations/line-chart', {
      model,
      options: {
        axis: {
          y: {
            series: {
              type: 'metric',
              config: {}
            }
          }
        }
      }
    }) as LineChart;

    assert.deepEqual(
      component.config.point,
      {
        r: 2,
        focus: {
          expand: { r: 4 }
        }
      },
      'the point radius is 2 for a single data point'
    );

    set(
      component.args,
      'model',
      A([
        {
          request: buildTestRequest(
            [{ field: 'uniqueIdentifier' }],
            [],
            { start: 'P2D', end: '2016-06-01 00:00:00.000' },
            'day'
          ),
          response: NaviFactResponse.create({
            rows: [
              {
                'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              },
              {
                'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              }
            ]
          })
        }
      ])
    );

    assert.deepEqual(
      component.config.point,
      {
        r: 0,
        focus: {
          expand: { r: 4 }
        }
      },
      'the point radius is 0 for a multiple data points'
    );
  });

  test('tooltips', function(assert) {
    const response = NaviFactResponse.create({
      //prettier-ignore
      rows: [
        { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', uniqueIdentifier: 172933788, totalPageViews: 3669828357 },
        { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', uniqueIdentifier: 183206656, totalPageViews: 4088487125 },
        { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', uniqueIdentifier: 183380921, totalPageViews: 4024700302 },
        { 'network.dateTime(grain=day)': '2016-06-02 00:00:00.000', uniqueIdentifier: 180559793, totalPageViews: 3950276031 },
        { 'network.dateTime(grain=day)': '2016-06-03 00:00:00.000', uniqueIdentifier: 172724594, totalPageViews: 3697156058 }
      ]
    });
    const request = buildTestRequest(
      [{ field: 'uniqueIdentifier' }, { field: 'totalPageViews' }],
      [],
      { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
      'day'
    );

    const model = { request, response };
    const options = {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    };
    const component = createGlimmerComponent('component:navi-visualizations/line-chart', {
      model: A([model]),
      options
    }) as LineChart;

    component.dataConfig; // since we're unit testing the component, this line is needed

    // get tooltip and see if it has the right rowData
    let tooltipComp = component.tooltipComponent;
    let tooltip = tooltipComp.create({
      tooltipData: [
        {
          name: 'Unique Identifiers',
          id: 'Unique Identifiers',
          index: 5,
          seriesIndex: 0,
          value: 172933788,
          x: '2016-06-03 00:00:00.000'
        }
      ],
      x: '2016-06-03 00:00:00.000',
      seriesConfig: component.seriesConfig,
      request
    });
    run(() => {
      let element = document.createElement('div');
      tooltip.appendTo(element);
    });
    assert.ok(
      tooltip.rowData.firstObject.hasOwnProperty('uniqueIdentifier'),
      'Initial tooltip render has the right rowData'
    );

    //new data
    let response2 = NaviFactResponse.create({
      rows: [
        { 'network.dateTime(grain=day)': '2016-05-30 00:00:00.000', navClicks: 172933788 },
        { 'network.dateTime(grain=day)': '2016-05-31 00:00:00.000', navClicks: 4088487125 },
        { 'network.dateTime(grain=day)': '2016-06-01 00:00:00.000', navClicks: 183380921 },
        { 'network.dateTime(grain=day)': '2016-06-02 00:00:00.000', navClicks: 3950276031 },
        { 'network.dateTime(grain=day)': '2016-06-03 00:00:00.000', navClicks: 172724594 }
      ]
    });

    set(component.args, 'model', A([{ request, response: response2 }]));

    component.dataConfig; // since we're unit testing the component, this line is needed
    tooltipComp = component.tooltipComponent;
    tooltip = tooltipComp.create({
      tooltipData: [
        {
          name: 'Nav Clicks',
          id: 'Nav Clicks',
          index: 5,
          seriesIndex: 0,
          value: 172933788,
          x: '2016-06-03 00:00:00.000'
        }
      ],
      x: '2016-06-03 00:00:00.000',
      seriesConfig: component.seriesConfig,
      request
    });
    run(() => {
      let element = document.createElement('div');
      tooltip.appendTo(element);
    });
    assert.ok(
      tooltip.rowData.firstObject.hasOwnProperty('navClicks'),
      'New response has tooltip render has the right rowData'
    );
  });

  test('line chart styles', function(assert) {
    let component = createGlimmerComponent('component:navi-visualizations/line-chart', {
      model: A([
        {
          response: NaviFactResponse.create({
            rows: [
              {
                'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              }
            ]
          }),
          request: buildTestRequest(
            [{ field: 'uniqueIdentifier' }, { field: 'totalPageViews' }],
            [],
            { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
            'day'
          )
        }
      ])
    }) as LineChart;

    assert.equal(component.config.data.type, 'line');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'line', area: true } });
    assert.equal(component.config.data.type, 'area', 'default of line returns as configured');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'spline', area: false } });
    assert.equal(component.config.data.type, 'spline', 'adding spline passes a spline config');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'spline', area: true } });
    assert.equal(component.config.data.type, 'area-spline', 'spline with area true returns a area spline config');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'step', area: false } });
    assert.equal(component.config.data.type, 'step', 'step returns a step config');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'step', area: true } });
    assert.equal(component.config.data.type, 'area-step', 'step with area true returns a area step config');

    //@ts-expect-error
    set(component.args, 'options', { style: { curve: 'moose', area: false } });
    assert.equal(component.config.data.type, 'line', 'bad config uses default line');
  });

  test('xAxisTickValues', function(assert) {
    assert.expect(4);

    const getModelDataFor = (start: string, end: string, timeGrain: string) => {
      return {
        response: NaviFactResponse.create({
          rows: [
            { [`network.dateTime(grain=${timeGrain})`]: start, uniqueIdentifier: 172933788 },
            { [`network.dateTime(grain=${timeGrain})`]: end, uniqueIdentifier: 183206656 }
          ]
        }),
        request: buildTestRequest([], [], { start, end }, timeGrain)
      };
    };

    const options = {
      axis: {
        y: {
          series: {
            type: 'dateTime',
            config: {
              timeGrain: 'year'
            }
          }
        }
      }
    };
    let component = createGlimmerComponent('component:navi-visualizations/line-chart', { options }) as LineChart;

    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let grain = 'day';
    set(component.args, 'model', A([getModelDataFor('2018-01-01T00:00:00.000Z', '2019-06-01T00:00:00.000Z', grain)]));
    let xAxisTickValues = component.xAxisTickValues;
    assert.deepEqual(
      xAxisTickValues.axis?.x.tick.values?.map((x: number) => GROUP[grain]?.by.year?.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    grain = 'week';
    set(component.args, 'model', A([getModelDataFor('2018-01-01 00:00:00.000', '2019-06-01 00:00:00.000', grain)]));
    xAxisTickValues = component.xAxisTickValues;
    assert.deepEqual(
      xAxisTickValues.axis?.x.tick.values?.map((x: number) => GROUP[grain]?.by.year?.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    grain = 'month';
    set(component.args, 'model', A([getModelDataFor('2018-01-01 00:00:00.000', '2019-06-01 00:00:00.000', grain)]));
    xAxisTickValues = component.xAxisTickValues;
    assert.deepEqual(
      xAxisTickValues.axis?.x.tick.values?.map((x: number) => GROUP[grain]?.by.year?.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    set(component.args, 'options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    grain = 'day';
    set(component.args, 'model', A([getModelDataFor('2018-01-01T00:00:00.000Z', '2019-06-01T00:00:00.000Z', grain)]));
    xAxisTickValues = component.xAxisTickValues;
    assert.deepEqual(xAxisTickValues, {}, 'Does not generate custom values for non-year timeGrain series');
  });
});
