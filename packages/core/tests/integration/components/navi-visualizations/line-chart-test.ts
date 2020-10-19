/* eslint-disable @typescript-eslint/camelcase */
import { Promise } from 'rsvp';
import { A } from '@ember/array';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
import { API_DATE_FORMAT_STRING } from 'navi-data/utils/date';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import NaviMetadataService from 'navi-data/services/navi-metadata';
import { TestContext } from 'ember-test-helpers';
import { buildTestRequest } from '../../../helpers/request';
import LineChart from 'navi-core/components/navi-visualizations/line-chart';
import StoreService from '@ember-data/store';

const TEMPLATE = hbs`
  <NaviVisualizations::LineChart
    @model={{this.model}}
    @options={{this.options}}
  />`;

let Model: LineChart['args']['model'];
let MetadataService: NaviMetadataService;

module('Integration | Component | line chart', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    injectC3Enhancements();

    Model = A([
      {
        request: buildTestRequest(
          [
            { cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' },
            { cid: 'cid_totalPageViews', field: 'totalPageViews' },
            { cid: 'cid_revenue(currency=USD)', field: 'revenue', parameters: { currency: 'USD' } }
          ],
          [{ cid: 'cid_age', field: 'age', parameters: { field: 'id' } }],
          { start: '2016-05-30 00:00:00.000', end: '2016-06-04 00:00:00.000' },
          'day'
        ),
        response: {
          rows: [
            {
              'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
              uniqueIdentifier: 172933788,
              totalPageViews: 3669828357,
              'revenue(currency=USD)': 2000323439.23
            },
            {
              'network.dateTime(grain=day)': '2016-05-31 00:00:00.000',
              uniqueIdentifier: 183206656,
              totalPageViews: 4088487125,
              'revenue(currency=USD)': 1999243823.74
            },
            {
              'network.dateTime(grain=day)': '2016-06-01 00:00:00.000',
              uniqueIdentifier: 183380921,
              totalPageViews: 4024700302,
              'revenue(currency=USD)': 1400324934.92
            },
            {
              'network.dateTime(grain=day)': '2016-06-02 00:00:00.000',
              uniqueIdentifier: 180559793,
              totalPageViews: 3950276031,
              'revenue(currency=USD)': 923843934.11
            },
            {
              'network.dateTime(grain=day)': '2016-06-03 00:00:00.000',
              uniqueIdentifier: 172724594,
              totalPageViews: 3697156058,
              'revenue(currency=USD)': 1623430236.42
            }
          ],
          meta: {}
        }
      }
    ]);

    this.set('model', Model);
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    MetadataService = this.owner.lookup('service:navi-metadata');
    await MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    MetadataService['keg'].reset();
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The line chart widget component is visible');

    assert.dom('.c3-chart-line').exists({ count: 3 }, 'All 3 metrics are shown on the chart');
  });

  test('missing data - metrics', async function(assert) {
    assert.expect(1);

    this.set(
      'model',
      A([
        {
          request: buildTestRequest(
            [{ cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' }],
            [],
            { start: '2016-05-30 00:00:00.000', end: '2016-06-02 00:00:00.000' },
            'day'
          ),
          response: {
            rows: [
              {
                'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788
              },
              {
                'network.dateTime(grain=day)': '2016-06-01 00:00:00.000',
                uniqueIdentifier: 183380921
              }
            ]
          }
        }
      ])
    );

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.c3-circle').map((el: SVGElement) => el.style.opacity),
      ['1', '0', '1'],
      'Missing data points are hidden by the chart'
    );
  });

  test('missing data - dimensions', async function(assert) {
    assert.expect(1);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metricCid: 'cid_uniqueIdentifier',
              dimensions: [
                {
                  name: 'All Other',
                  values: { cid_age: '-3' }
                }
              ]
            }
          }
        }
      }
    });

    this.set(
      'model',
      A([
        {
          request: buildTestRequest(
            [{ cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' }],
            [{ cid: 'cid_age', field: 'age', parameters: { field: 'id' } }],
            { start: '2016-05-30 00:00:00.000', end: '2016-06-02 00:00:00.000' },
            'day'
          ),
          response: {
            rows: [
              {
                'network.dateTime(grain=day)': '2016-05-30 00:00:00.000',
                'age(field=id)': '-3',
                uniqueIdentifier: 172933788
              },
              {
                'network.dateTime(grain=day)': '2016-06-01 00:00:00.000',
                'age(field=id)': '-3',
                uniqueIdentifier: 183380921
              }
            ]
          }
        }
      ])
    );

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.c3-circle').map((el: SVGElement) => el.style.opacity),
      ['1', '0', '1'],
      'Missing data points are hidden by the chart'
    );
  });

  test('multiple series', async function(assert) {
    assert.expect(1);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    this.set('model', Model);
    await render(TEMPLATE);

    assert
      .dom('.c3-chart-line')
      .exists({ count: 3 }, 'Three chart lines are present in the chart based on the metrics in the request');
  });

  test('y axis label', async function(assert) {
    assert.expect(3);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metricCid: 'cid_totalPageViews',
              dimensions: [
                {
                  name: 'All Other',
                  values: { cid_age: '-3' }
                },
                {
                  name: 'under 13',
                  values: { cid_age: '1' }
                },
                {
                  name: '13 - 25',
                  values: { cid_age: '2' }
                },
                {
                  name: '25 - 35',
                  values: { cid_age: '3' }
                },
                {
                  name: '35 - 45',
                  values: { cid_age: '4' }
                }
              ]
            }
          }
        }
      }
    });

    this.set('model', Model);
    await render(TEMPLATE);

    assert
      .dom('.c3-axis-y-label')
      .hasText('Total Page Views', 'The metric name is displayed in the y axis label correctly for a dimension chart');

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metricCid: 'cid_revenue(currency=USD)',
              dimensions: [
                {
                  name: 'All Other',
                  values: { cid_age: '-3' }
                },
                {
                  name: 'under 13',
                  values: { cid_age: '1' }
                },
                {
                  name: '13 - 25',
                  values: { cid_age: '2' }
                },
                {
                  name: '25 - 35',
                  values: { cid_age: '3' }
                },
                {
                  name: '35 - 45',
                  values: { cid_age: '4' }
                }
              ]
            }
          }
        }
      }
    });

    assert
      .dom('.c3-axis-y-label')
      .hasText('Revenue (USD)', 'Parameterized metrics are displayed correctly in the y axis label');

    //set chart type to metric
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    assert.dom('.c3-axis-y-label').hasText('', 'The y axis label is not displayed for a metric chart.');
  });

  test('Highlight data points', async function(assert) {
    // assert.expect(1);

    let anomalousDataModel = A([
      {
        request: buildTestRequest(
          [{ field: 'uniqueIdentifier' }],
          [],
          { start: '2017-09-01 00:00:00.000', end: '2017-09-07 00:00:00.000' },
          'day'
        ),
        response: {
          rows: [
            {
              'network.dateTime(grain=day)': '2017-09-01 00:00:00.000',
              uniqueIdentifier: 155191081
            },
            {
              'network.dateTime(grain=day)': '2017-09-02 00:00:00.000',
              uniqueIdentifier: 172724594
            },
            {
              'network.dateTime(grain=day)': '2017-09-03 00:00:00.000',
              uniqueIdentifier: 183380921
            },
            {
              'network.dateTime(grain=day)': '2017-09-04 00:00:00.000',
              uniqueIdentifier: 172933788
            },
            {
              'network.dateTime(grain=day)': '2017-09-05 00:00:00.000',
              uniqueIdentifier: 183206656
            },
            {
              'network.dateTime(grain=day)': '2017-09-06 00:00:00.000',
              uniqueIdentifier: 183380921
            },
            {
              'network.dateTime(grain=day)': '2017-09-07 00:00:00.000',
              uniqueIdentifier: 180559793
            }
          ]
        }
      },
      new Promise(resolve => {
        resolve(
          A([
            {
              index: 1,
              actual: 12,
              predicted: 172724594.12345,
              standardDeviation: 123.123456
            },
            {
              index: 3,
              actual: 10,
              predicted: 172933788.12345,
              standardDeviation: 123.123456
            },
            {
              index: 5,
              actual: 14,
              predicted: 183380921.12345,
              standardDeviation: 123.123456
            }
          ])
        );
      })
    ]);

    this.set('model', anomalousDataModel);
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });
    await render(TEMPLATE);

    assert.dom('.c3-selected-circles circle').exists({ count: 3 }, 'Three data points are highlighted in chart');
  });

  test('dateTime model', async function(assert) {
    assert.expect(1);
    let start = moment('2016-05-01 00:00:00.000'),
      end = moment('2018-07-01 00:00:00.000'),
      current = start.clone(),
      rows = [];

    while (current.isBefore(end)) {
      rows.push({
        'network.dateTime(grain=month)': current.format(API_DATE_FORMAT_STRING),
        uniqueIdentifier: Math.random() * 1000
      });

      current.add(1, 'month');
    }

    this.set(
      'model',
      A([
        {
          request: buildTestRequest(
            [{ cid: 'cid_uniqueIdentifier', field: 'uniqueIdentifier' }],
            [],
            { start: start.format(API_DATE_FORMAT_STRING), end: end.format(API_DATE_FORMAT_STRING) },
            'month'
          ),
          response: {
            rows,
            meta: {}
          }
        }
      ])
    );
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dateTime',
            config: {
              metricCid: 'cid_uniqueIdentifier',
              timeGrain: 'year'
            }
          }
        }
      }
    });

    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent),
      ['2016', '2017', '2018'],
      'Three years time series are displayed on y-axis'
    );
  });

  test('Metric series legend', async function(assert) {
    assert.expect(1);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    this.set('model', Model);
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent),
      ['Unique Identifiers', 'Total Page Views', 'Revenue (USD)'],
      'Metric display names are used properly for parameterized and non-parameterized metrics in the legend'
    );
  });

  test('multi-datasource labels', async function(this: TestContext, assert) {
    MetadataService['keg'].reset();
    await MetadataService.loadMetadata({ dataSourceName: 'bardTwo' });

    assert.expect(1);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    const store = this.owner.lookup('service:store') as StoreService;
    this.set(
      'model',
      A([
        {
          request: store.createFragment('bard-request-v2/request', {
            table: 'inventory',
            columns: [
              {
                type: 'timeDimension',
                field: 'inventory.dateTime',
                parameters: {
                  grain: 'day'
                },
                source: 'bardTwo'
              },
              { type: 'metric', field: 'ownedQuantity', parameters: {}, source: 'bardTwo' },
              { type: 'metric', field: 'usedAmount', parameters: {}, source: 'bardTwo' }
            ],
            filters: [
              {
                type: 'timeDimension',
                field: 'inventory.dateTime',
                parameters: {
                  grain: 'day'
                },
                operator: 'bet',
                values: ['2016-05-30 00:00:00.000', '2016-06-04 00:00:00.000'],
                source: 'bardTwo'
              }
            ],
            sorts: [],
            limit: null,
            dataSource: 'bardTwo',
            requestVersion: '2.0'
          }),
          response: {
            rows: [
              {
                'inventory.dateTime(grain=day)': '2016-05-30 00:00:00.000',
                ownedQuantity: 172933788,
                usedAmount: 3669828357
              },
              {
                'inventory.dateTime(grain=day)': '2016-05-31 00:00:00.000',
                ownedQuantity: 183206656,
                usedAmount: 4088487125
              },
              {
                'inventory.dateTime(grain=day)': '2016-06-01 00:00:00.000',
                ownedQuantity: 183380921,
                usedAmount: 4024700302
              },
              {
                'inventory.dateTime(grain=day)': '2016-06-02 00:00:00.000',
                ownedQuantity: 180559793,
                usedAmount: 3950276031
              },
              {
                'inventory.dateTime(grain=day)': '2016-06-03 00:00:00.000',
                ownedQuantity: 172724594,
                usedAmount: 3697156058
              }
            ],
            meta: {}
          }
        }
      ])
    );
    await render(TEMPLATE);

    assert.deepEqual(
      findAll('.c3-legend-item').map(el => el.textContent),
      ['Quantity of thing', 'Used Amount'],
      'Metric display names are used properly for parameterized and non-parameterized metrics in the legend'
    );
  });

  test('cleanup tooltip', async function(assert) {
    assert.expect(2);

    const template = hbs`
    {{#if this.shouldRender}}
      <NaviVisualizations::LineChart
        @model={{this.model}}
        @options={{this.options}}
      />
    {{/if}}`;

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {}
          }
        }
      }
    });

    const findTooltipComponent = () =>
      //@ts-expect-error
      Object.keys(this.owner.__registry__.registrations).find(r =>
        r.startsWith('component:line-chart-metric-tooltip-')
      );

    this.set('model', Model);
    this.set('shouldRender', true);
    await render(template);

    assert.ok(findTooltipComponent(), 'tooltip component is registered when chart is created');

    this.set('shouldRender', false);

    assert.notOk(findTooltipComponent(), 'tooltip component is unregistered when chart is destroyed');
  });
});
