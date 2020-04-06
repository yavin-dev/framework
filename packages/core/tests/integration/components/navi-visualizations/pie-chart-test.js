import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import $ from 'jquery';
import { next } from '@ember/runloop';
import { getTranslation } from 'navi-core/utils/chart';
import { cloneDeep } from 'lodash-es';

const TEMPLATE = hbs`
    {{navi-visualizations/pie-chart
        model=model
        options=options
    }}`;

const Model = A([
  {
    request: {
      logicalTable: {
        timeGrain: 'day'
      },
      intervals: [
        {
          start: '2015-12-14 00:00:00.000',
          end: '2015-12-15 00:00:00.000'
        }
      ],
      metrics: [
        {
          metric: {
            id: 'totalPageViews',
            name: 'Total Page Views'
          }
        },
        {
          metric: {
            id: 'uniqueIdentifier',
            name: 'Unique Identifier'
          }
        }
      ],
      dimensions: [
        {
          dimension: {
            id: 'age',
            name: 'Age'
          }
        }
      ]
    },
    response: {
      rows: [
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '-3',
          'age|desc': 'All Other',
          uniqueIdentifier: 155191081,
          totalPageViews: 310382162,
          'revenue(currency=USD)': 200,
          'revenue(currency=CAD)': 300
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639,
          'revenue(currency=USD)': 300,
          'revenue(currency=CAD)': 256
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639,
          'revenue(currency=USD)': 400,
          'revenue(currency=CAD)': 5236
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 500,
          'revenue(currency=CAD)': 4321
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 600,
          'revenue(currency=CAD)': 132
        }
      ]
    }
  }
]);

let MetadataService;

module('Integration | Component | pie chart', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    injectC3Enhancements();
    this.set('model', Model);
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    MetadataService._keg.reset();
  });

  test('it renders for a dimension series', async function(assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'totalPageViews',
            parameters: {},
            canonicalName: 'totalPageViews'
          },
          dimensionOrder: ['age'],
          dimensions: [
            {
              name: 'All Other',
              values: { age: '-3' }
            },
            {
              name: 'Under 13',
              values: { age: '1' }
            }
          ]
        }
      }
    });
    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.c3-target-All-Other text')
      .hasText('13.02%', 'Percentage label shown on slice is formatted properly for `All Other`');

    assert
      .dom('.c3-target-Under-13 text')
      .hasText('86.98%', 'Percentage label shown on slice is formatted properly for `Under 13`');
  });

  test('it renders for a metric series', async function(assert) {
    assert.expect(4);

    this.set('options', {
      series: {
        type: 'metric',
        config: {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            },
            {
              metric: 'uniqueIdentifier',
              parameters: {},
              canonicalName: 'uniqueIdentifier'
            }
          ]
        }
      }
    });
    await render(TEMPLATE);

    assert.dom('.navi-vis-c3-chart').isVisible('The pie chart widget component is visible');

    assert.dom('.c3-chart-arc').exists({ count: 2 }, 'Two pie slices are present on the chart');

    assert
      .dom('.c3-target-Total-Page-Views text')
      .hasText('66.67%', 'Percentage label shown on slice is formatted properly for `Total Page Views`');

    assert
      .dom('.c3-target-Unique-Identifiers text')
      .hasText('33.33%', 'Percentage label shown on slice is formatted properly for `Unique Identifier`');
  });

  test('metric label', async function(assert) {
    assert.expect(7);

    this.set('options', {
      series: {
        type: 'metric',
        config: {
          metrics: [
            {
              metric: 'totalPageViews',
              parameters: {},
              canonicalName: 'totalPageViews'
            },
            {
              metric: 'uniqueIdentifier',
              parameters: {},
              canonicalName: 'uniqueIdentifier'
            }
          ]
        }
      }
    });

    await render(TEMPLATE);

    assert.dom('.c3-title').hasText('', 'The metric label is not visible for a series of type metric');

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'totalPageViews',
            parameters: {},
            canonicalName: 'totalPageViews'
          },
          dimensionOrder: ['age'],
          dimensions: [
            {
              name: 'All Other',
              values: { age: '-3' }
            },
            {
              name: 'Under 13',
              values: { age: '1' }
            }
          ]
        }
      }
    });

    await render(TEMPLATE);

    assert.dom('.c3-title').hasText('Total Page Views', 'The metric name is displayed in the metric label correctly');

    //Calulate where the metric label should be relative to the pie chart
    let chartElm = find('.c3-chart-arcs'),
      xTranslate =
        getTranslation(chartElm.getAttribute('transform')).x - chartElm.getBoundingClientRect().width / 2 - 50,
      yTranslate = find('svg').getAttribute('height') / 2;

    next(() => {
      assert.equal(
        Math.round(getTranslation(find('.c3-title').getAttribute('transform')).x),
        Math.round(xTranslate),
        'The metric name is in the correct X position on initial render'
      );

      assert.equal(
        Math.round(getTranslation(find('.c3-title').getAttribute('transform')).y),
        Math.round(yTranslate),
        'The metric name is in the correct Y position on initial render'
      );
    });

    /*
     * Resize the parent element of the SVG that the pie chart is drawn in
     * This effectively moves the pie chart to the left
     */
    find('.pie-chart-widget').style.maxWidth = '1000px';

    //Rerender with a new metric and new chart position
    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'uniqueIdentifier',
            parameters: {},
            canonicalName: 'uniqueIdentifier'
          },
          dimensionOrder: ['age'],
          dimensions: [
            {
              name: 'All Other',
              values: { age: '-3' }
            },
            {
              name: 'Under 13',
              values: { age: '1' }
            }
          ]
        }
      }
    });

    //Recalculate these after the chart is rerendered
    chartElm = find('.c3-chart-arcs');
    xTranslate = getTranslation(chartElm.getAttribute('transform')).x - chartElm.getBoundingClientRect().width / 2 - 50;
    yTranslate =
      $('svg')
        .css('height')
        .replace('px', '') / 2;

    assert.dom('.c3-title').hasText('Unique Identifiers', 'The metric label is updated after the metric is changed');

    assert.equal(
      Math.round(getTranslation(find('.c3-title').getAttribute('transform')).x),
      Math.round(xTranslate),
      'The metric name is in the correct X position after the pie chart moves'
    );

    assert.equal(
      Math.round(getTranslation(find('.c3-title').getAttribute('transform')).y),
      Math.round(yTranslate),
      'The metric name is in the correct Y position after the pie chart moves'
    );
  });

  test('parameterized metric renders correctly for dimension series', async function(assert) {
    assert.expect(5);

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'revenue',
            parameters: {
              currency: 'USD'
            },
            canonicalName: 'revenue(currency=USD)'
          },
          dimensionOrder: ['age'],
          dimensions: [
            {
              name: 'All Other',
              values: { age: '-3' }
            },
            {
              name: 'Under 13',
              values: { age: '1' }
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
      .dom('.c3-target-All-Other text')
      .hasText('40%', 'Percentage label shown on slice is formatted properly for `All Other`');

    assert
      .dom('.c3-target-Under-13 text')
      .hasText('60%', 'Percentage label shown on slice is formatted properly for `Under 13`');
  });

  test('renders correctly with multi datasource', async function(assert) {
    assert.expect(1);
    MetadataService._keg.reset();
    await MetadataService.loadMetadata({ dataSourceName: 'blockhead' });
    const blockheadModel = cloneDeep(Model[0]);
    blockheadModel.request.dataSource = 'blockhead';
    this.set('model', A([blockheadModel]));

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'globalySold',
            parameters: {},
            canonicalName: 'globalySold'
          },
          dimensionOrder: ['container'],
          dimensions: [
            {
              name: 'Bag',
              values: { container: '1' }
            },
            {
              name: 'Bank',
              values: { container: '2' }
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

    this.set('options', {
      series: {
        type: 'metric',
        config: {
          metrics: [
            {
              metric: 'revenue',
              parameters: {
                currency: 'USD'
              },
              canonicalName: 'revenue(currency=USD)'
            },
            {
              metric: 'revenue',
              parameters: {
                currency: 'CAD'
              },
              canonicalName: 'revenue(currency=CAD)'
            }
          ]
        }
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
    {{#if shouldRender}}
      {{navi-visualizations/pie-chart
        model=model
        options=options
      }}
    {{/if}}`;

    this.set('options', {
      series: {
        type: 'dimension',
        config: {
          metric: {
            metric: 'revenue',
            parameters: { currency: 'USD' },
            canonicalName: 'revenue(currency=USD)'
          },
          dimensionOrder: ['age'],
          dimensions: [{ name: 'All Other', values: { age: '-3' } }, { name: 'Under 13', values: { age: '1' } }]
        }
      }
    });

    const findTooltipComponent = () =>
      Object.keys(this.owner.__registry__.registrations).find(r => r.startsWith('component:pie-chart-tooltip-'));

    this.set('model', Model);
    this.set('shouldRender', true);
    await render(template);

    assert.ok(findTooltipComponent(), 'tooltip component is registered when chart is created');

    this.set('shouldRender', false);

    assert.notOk(findTooltipComponent(), 'tooltip component is unregistered when chart is destroyed');
  });
});
