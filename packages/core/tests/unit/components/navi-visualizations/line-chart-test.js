import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { merge } from 'lodash-es';
import { GROUP } from 'navi-core/chart-builders/date-time';

module('Unit | Component | line chart', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('dataConfig', function(assert) {
    assert.expect(4);

    let response = {
        rows: [
          {
            dateTime: '2016-05-30 00:00:00.000',
            uniqueIdentifier: 172933788,
            totalPageViews: 3669828357
          },
          {
            dateTime: '2016-05-31 00:00:00.000',
            uniqueIdentifier: 183206656,
            totalPageViews: 4088487125
          },
          {
            dateTime: '2016-06-01 00:00:00.000',
            uniqueIdentifier: 183380921,
            totalPageViews: 4024700302
          },
          {
            dateTime: '2016-06-02 00:00:00.000',
            uniqueIdentifier: 180559793,
            totalPageViews: 3950276031
          },
          {
            dateTime: '2016-06-03 00:00:00.000',
            uniqueIdentifier: 172724594,
            totalPageViews: 3697156058
          }
        ]
      },
      request = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-06-04 00:00:00.000'
          }
        ]
      };

    let options = {
      style: { stacked: false },
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [
                {
                  metric: 'totalPageViews',
                  parameters: {},
                  canonicalName: 'totalPageViews'
                }
              ]
            }
          }
        }
      }
    };

    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create(),
      model = { request, response };

    component.set('model', A([model]));
    component.set('options', options);

    let expectedData = response.rows.map(row => {
      return {
        x: {
          rawValue: row.dateTime,
          displayValue: moment(row.dateTime).format('MMM D')
        },
        'Total Page Views': row.totalPageViews
      };
    });

    assert.deepEqual(
      component.get('dataConfig.data.json'),
      expectedData,
      'Data config contains json property with values for each x value and each series'
    );

    assert.deepEqual(
      component.get('dataConfig.data.groups'),
      [],
      'Data config groups is empty when chart is not stacked'
    );

    options = {
      axis: {
        y: {
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
        }
      }
    };

    component.set('options', options);

    expectedData = response.rows.map(row => {
      return {
        x: {
          rawValue: row.dateTime,
          displayValue: moment(row.dateTime).format('MMM D')
        },
        'Unique Identifiers': row.uniqueIdentifier,
        'Total Page Views': row.totalPageViews
      };
    });

    assert.deepEqual(component.get('dataConfig.data.json'), expectedData, 'Data config updates with series options');

    component.set('options', Object.assign({}, options, { style: { stacked: true } }));

    assert.deepEqual(
      component.get('dataConfig.data.groups'),
      [['Total Page Views', 'Unique Identifiers']],
      'Data config groups is array of series keys when chart is stacked'
    );
  });

  test('dataSelectionConfig', function(assert) {
    assert.expect(2);

    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create(),
      insightsDataPromise = new Promise(resolve => {
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

    component.set('model', A([{}, insightsDataPromise]));

    assert.ok(
      component.get('dataSelectionConfig.dataSelection').then,
      'Data selection config returns a promise as expected'
    );

    component.get('dataSelectionConfig.dataSelection').then(insightsData => {
      assert.deepEqual(
        insightsData.mapBy('index'),
        [1],
        'dataSelectionConfig promise resovles to an array of indices to highlight data points'
      );
    });
  });

  test('config', function(assert) {
    assert.expect(4);
    const componentIdentifier = 'component:navi-visualizations/line-chart',
      originalComponent = this.owner.factoryFor(componentIdentifier),
      componentClass = originalComponent.class.extend({
        get dataConfig() {
          return {};
        } // dataConfig has a separate test
      });
    this.owner.unregister(componentIdentifier);
    this.owner.register(componentIdentifier, componentClass);

    const component = this.owner.factoryFor(componentIdentifier).create({
        model: A([{ response: { rows: [] } }])
      }),
      defaultConfig = {
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
              config: {
                metrics: []
              }
            },
            tick: component.get('config.axis.y.tick')
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
        tooltip: component.get('chartTooltip')
      };

    assert.deepEqual(component.get('config'), defaultConfig, 'Component has a defaultConfig');

    let newGrid = {
      x: { show: false }
    };

    component.set('options', {
      grid: newGrid
    });

    assert.deepEqual(
      component.get('config'),
      merge({}, defaultConfig, {
        grid: newGrid,
        tooltip: component.get('chartTooltip')
      }),
      'Component merges the defined options with the default config'
    );

    /* == Test Y Axis Label on Non-metric charts == */
    let dimensionChartType = {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metric: {
                metric: 'totalPageViews',
                parameters: {},
                canonicalName: 'totalPageViews'
              }
            }
          }
        }
      }
    };

    //set chart type to be dimension
    component.set('options', dimensionChartType);

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
      component.get('config'),
      merge({}, defaultConfig, dimensionChartType, yAxislabelOptions, {
        tooltip: component.get('chartTooltip')
      }),
      'Component displays y-axis label for a non-metric chart'
    );

    //set the chart type to be metric
    component.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric'
          }
        }
      }
    });

    assert.deepEqual(
      component.get('config.axis.y.label'),
      { position: 'outer-middle' },
      'Component does not display y-axis label for a metric chart'
    );

    this.owner.unregister(componentIdentifier);
    this.owner.register(componentIdentifier, originalComponent);
  });

  test('single data point', function(assert) {
    assert.expect(2);

    let model = A([
        {
          request: {
            metrics: ['uniqueIdentifier'],
            intervals: [
              {
                start: 'P1D',
                end: '2016-05-31 00:00:00.000'
              }
            ],
            logicalTable: {
              timeGrain: 'day'
            }
          },
          response: {
            rows: [
              {
                dateTime: '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              }
            ]
          }
        }
      ]),
      component = this.owner.factoryFor('component:navi-visualizations/line-chart').create({
        options: {
          axis: {
            y: {
              series: {
                type: 'metric',
                config: {
                  metrics: [{ metric: 'foo', parameters: {}, canonicalName: 'foo' }]
                }
              }
            }
          }
        }
      });

    component.set('model', model);

    assert.deepEqual(
      component.get('config.point'),
      {
        r: 2,
        focus: {
          expand: { r: 4 }
        }
      },
      'the point radius is 2 for a single data point'
    );

    component.set(
      'model',
      A([
        {
          request: {
            metrics: ['uniqueIdentifier'],
            intervals: [
              {
                start: 'P2D',
                end: '2016-06-01 00:00:00.000'
              }
            ],
            logicalTable: {
              timeGrain: 'day'
            }
          },
          response: {
            rows: [
              {
                dateTime: '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              },
              {
                dateTime: '2016-05-31 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              }
            ]
          }
        }
      ])
    );

    assert.deepEqual(
      component.get('config.point'),
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
    let response = {
        rows: [
          {
            dateTime: '2016-05-30 00:00:00.000',
            uniqueIdentifier: 172933788,
            totalPageViews: 3669828357
          },
          {
            dateTime: '2016-05-31 00:00:00.000',
            uniqueIdentifier: 183206656,
            totalPageViews: 4088487125
          },
          {
            dateTime: '2016-06-01 00:00:00.000',
            uniqueIdentifier: 183380921,
            totalPageViews: 4024700302
          },
          {
            dateTime: '2016-06-02 00:00:00.000',
            uniqueIdentifier: 180559793,
            totalPageViews: 3950276031
          },
          {
            dateTime: '2016-06-03 00:00:00.000',
            uniqueIdentifier: 172724594,
            totalPageViews: 3697156058
          }
        ]
      },
      request = {
        logicalTable: {
          timeGrain: 'day'
        },
        intervals: [
          {
            start: '2016-05-30 00:00:00.000',
            end: '2016-06-04 00:00:00.000'
          }
        ]
      };

    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create(),
      model = { request, response };

    component.set('model', A([model]));
    component.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [
                {
                  metric: 'totalPageViews',
                  parameters: {},
                  canonicalName: 'totalPageViews'
                }
              ]
            }
          }
        }
      }
    });

    component.get('dataConfig');

    // get tooltip and see if it has the right rowData
    let tooltipComp = component.get('tooltipComponent');
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
      seriesConfig: component.get('seriesConfig'),
      request
    });
    run(() => {
      let element = document.createElement('div');
      tooltip.appendTo(element);
    });
    assert.ok(
      tooltip.get('rowData.firstObject').hasOwnProperty('uniqueIdentifier'),
      'Initial tooltip render has the right rowData'
    );

    //new data
    let response2 = {
      rows: [
        {
          dateTime: '2016-05-30 00:00:00.000',
          navClicks: 172933788
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          navClicks: 4088487125
        },
        {
          dateTime: '2016-06-01 00:00:00.000',
          navClicks: 183380921
        },
        {
          dateTime: '2016-06-02 00:00:00.000',
          navClicks: 3950276031
        },
        {
          dateTime: '2016-06-03 00:00:00.000',
          navClicks: 172724594
        }
      ]
    };

    component.set('model', A([{ request, response: response2 }]));

    component.get('dataConfig');
    tooltipComp = component.get('tooltipComponent');
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
      seriesConfig: component.get('seriesConfig'),
      request
    });
    run(() => {
      let element = document.createElement('div');
      tooltip.appendTo(element);
    });
    assert.ok(
      tooltip.get('rowData.firstObject').hasOwnProperty('navClicks'),
      'New response has tooltip render has the right rowData'
    );
  });

  test('line chart styles', function(assert) {
    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create({
      model: A([
        {
          response: {
            rows: [
              {
                dateTime: '2016-05-30 00:00:00.000',
                uniqueIdentifier: 172933788,
                totalPageViews: 3669828357
              }
            ]
          },
          request: {
            logicalTable: {
              timeGrain: 'day'
            },
            intervals: [
              {
                start: '2016-05-30 00:00:00.000',
                end: '2016-06-04 00:00:00.000'
              }
            ]
          }
        }
      ])
    });

    assert.equal(component.config.data.type, 'line');

    component.set('options', { style: { curve: 'line', area: true } });
    assert.equal(component.config.data.type, 'area', 'default of line returns as configured');

    component.set('options', { style: { curve: 'spline', area: false } });
    assert.equal(component.config.data.type, 'spline', 'adding spline passes a spline config');

    component.set('options', { style: { curve: 'spline', area: true } });
    assert.equal(component.config.data.type, 'area-spline', 'spline with area true returns a area spline config');

    component.set('options', { style: { curve: 'step', area: false } });
    assert.equal(component.config.data.type, 'step', 'step returns a step config');

    component.set('options', { style: { curve: 'step', area: true } });
    assert.equal(component.config.data.type, 'area-step', 'step with area true returns a area step config');

    component.set('options', { style: { curve: 'moose', area: false } });
    assert.equal(component.config.data.type, 'line', 'bad config uses default line');
  });

  test('xAxisTickValues', function(assert) {
    assert.expect(4);

    const getModelDataFor = (start, end, timeGrain) => {
      return {
        response: {
          rows: [
            {
              dateTime: start,
              uniqueIdentifier: 172933788
            },
            {
              dateTime: end,
              uniqueIdentifier: 183206656
            }
          ]
        },
        request: {
          logicalTable: {
            timeGrain
          },
          intervals: [
            {
              start,
              end
            }
          ]
        }
      };
    };

    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create();

    component.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              timeGrain: 'year'
            }
          }
        }
      }
    });

    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let grain = 'day';
    component.set('model', A([getModelDataFor('2018-01-01T00:00:00.000Z', '2019-06-01T00:00:00.000Z', grain)]));
    let xAxisTickValues = component.get('xAxisTickValues');
    assert.deepEqual(
      xAxisTickValues.axis.x.tick.values.map(x => GROUP[grain].by.year.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    grain = 'week';
    component.set('model', A([getModelDataFor('2018-01-01 00:00:00.000', '2019-06-01 00:00:00.000', grain)]));
    xAxisTickValues = component.get('xAxisTickValues');
    assert.deepEqual(
      xAxisTickValues.axis.x.tick.values.map(x => GROUP[grain].by.year.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    grain = 'month';
    component.set('model', A([getModelDataFor('2018-01-01 00:00:00.000', '2019-06-01 00:00:00.000', grain)]));
    xAxisTickValues = component.get('xAxisTickValues');
    assert.deepEqual(
      xAxisTickValues.axis.x.tick.values.map(x => GROUP[grain].by.year.getXDisplay(x + 1)),
      allMonths,
      `Create label for each month on ${grain} grain year chart`
    );

    component.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric'
          }
        }
      }
    });

    grain = 'day';
    component.set('model', A([getModelDataFor('2018-01-01T00:00:00.000Z', '2019-06-01T00:00:00.000Z', grain)]));
    xAxisTickValues = component.get('xAxisTickValues');
    assert.deepEqual(xAxisTickValues, {}, 'Does not generate custom values for non-year timeGrain series');
  });
});
