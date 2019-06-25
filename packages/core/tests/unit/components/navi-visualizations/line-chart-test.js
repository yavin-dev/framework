import { Promise } from 'rsvp';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import moment from 'moment';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';
import merge from 'lodash/merge';

let MetadataService;

module('Unit | Component | line chart', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('dataConfig', function(assert) {
    assert.expect(2);

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

    let options = {
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

    let component = this.owner.factoryFor('component:navi-visualizations/line-chart').create({
        dataConfig: {}, // dataConfig has a seperate test
        model: A([{ response: { rows: [] } }])
      }),
      defaultConfig = {
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
});
