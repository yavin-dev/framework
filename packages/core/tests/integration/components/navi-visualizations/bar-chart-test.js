import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
import { setupMock, teardownMock } from '../../../helpers/mirage-helper';

let MetadataService;

const TEMPLATE = hbs`
  {{navi-visualizations/bar-chart
    model=model
    options=options
  }}`;

const Model = A([
  {
    request: {
      metrics: [
        {
          metric: 'uniqueIdentifier',
          parameters: {},
          canonicalName: 'uniqueIdentifier',
          toJSON() {
            return this;
          }
        }
      ],
      intervals: [
        {
          start: '2016-05-30 00:00:00.000',
          end: '2016-06-04 00:00:00.000'
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
    }
  }
]);

const DimensionModel = A([
  {
    request: {
      metrics: ['uniqueIdentifier', 'totalPageViews'],
      intervals: [
        {
          start: '2015-12-14 00:00:00.000',
          end: '2016-02-22 00:00:00.000'
        }
      ],
      logicalTable: {
        timeGrain: 'week'
      }
    },
    response: {
      rows: [
        {
          dateTime: '2016-02-15 00:00:00.000',
          'age|id': '-3',
          'age|desc': 'All Other',
          uniqueIdentifier: 155191081,
          totalPageViews: 3072620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639
        },
        {
          dateTime: '2015-12-21 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 72724594,
          totalPageViews: 2697156058
        },
        {
          dateTime: '2015-12-28 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 83380921,
          totalPageViews: 3024700302
        },
        {
          dateTime: '2016-01-04 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 72933788,
          totalPageViews: 2669828357
        },
        {
          dateTime: '2016-01-11 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 83206656,
          totalPageViews: 3088487125
        },
        {
          dateTime: '2016-01-18 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 83380921,
          totalPageViews: 2024700302
        },
        {
          dateTime: '2016-01-25 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 80559793,
          totalPageViews: 2950276031
        },
        {
          dateTime: '2016-02-01 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 72724594,
          totalPageViews: 2697156058
        },
        {
          dateTime: '2016-02-08 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 52298735,
          totalPageViews: 2008425744
        },
        {
          dateTime: '2016-02-15 00:00:00.000',
          'age|id': '1',
          'age|desc': 'under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639
        },
        {
          dateTime: '2015-12-21 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 72724594,
          totalPageViews: 2156058
        },
        {
          dateTime: '2015-12-28 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 83380921,
          totalPageViews: 24700302
        },
        {
          dateTime: '2016-01-04 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 72933788,
          totalPageViews: 9828357
        },
        {
          dateTime: '2016-01-11 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 83206656,
          totalPageViews: 88487125
        },
        {
          dateTime: '2016-01-18 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 83380921,
          totalPageViews: 4700302
        },
        {
          dateTime: '2016-01-25 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 80559793,
          totalPageViews: 276031
        },
        {
          dateTime: '2016-02-01 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 72724594,
          totalPageViews: 7156058
        },
        {
          dateTime: '2016-02-08 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 52298735,
          totalPageViews: 8425744
        },
        {
          dateTime: '2016-02-15 00:00:00.000',
          'age|id': '2',
          'age|desc': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        },
        {
          dateTime: '2015-12-21 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 72724594,
          totalPageViews: 697156058
        },
        {
          dateTime: '2015-12-28 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 83380921,
          totalPageViews: 24700302
        },
        {
          dateTime: '2016-01-04 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 72933788,
          totalPageViews: 669828357
        },
        {
          dateTime: '2016-01-11 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 83206656,
          totalPageViews: 88487125
        },
        {
          dateTime: '2016-01-18 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 83380921,
          totalPageViews: 24700302
        },
        {
          dateTime: '2016-01-25 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 80559793,
          totalPageViews: 950276031
        },
        {
          dateTime: '2016-02-01 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 72724594,
          totalPageViews: 697156058
        },
        {
          dateTime: '2016-02-08 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 52298735,
          totalPageViews: 8425744
        },
        {
          dateTime: '2016-02-15 00:00:00.000',
          'age|id': '3',
          'age|desc': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        },
        {
          dateTime: '2015-12-21 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 72724594,
          totalPageViews: 97156058
        },
        {
          dateTime: '2015-12-28 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 83380921,
          totalPageViews: 24700302
        },
        {
          dateTime: '2016-01-04 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 72933788,
          totalPageViews: 2669828357
        },
        {
          dateTime: '2016-01-11 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 83206656,
          totalPageViews: 88487125
        },
        {
          dateTime: '2016-01-18 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 83380921,
          totalPageViews: 24700302
        },
        {
          dateTime: '2016-01-25 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 80559793,
          totalPageViews: 50276031
        },
        {
          dateTime: '2016-02-01 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 72724594,
          totalPageViews: 97156058
        },
        {
          dateTime: '2016-02-08 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 52298735,
          totalPageViews: 8425744
        },
        {
          dateTime: '2016-02-15 00:00:00.000',
          'age|id': '4',
          'age|desc': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639
        }
      ]
    }
  }
]);

module('Integration | Component | bar chart', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    setupMock();
    injectC3Enhancements();

    this.set('model', Model);
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [
                {
                  metric: 'adClicks',
                  canonicalName: 'adClicks',
                  toJSON() {
                    return this;
                  }
                }
              ]
            }
          }
        }
      }
    });

    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  hooks.afterEach(function() {
    teardownMock();
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert.ok(this.$('.navi-vis-c3-chart').is(':visible'), 'The bar chart widget component is visible');

    assert.dom('.c3-bar').exists({ count: 5 }, '5 bars are present on the chart');
  });

  test('multiple metric series', async function(assert) {
    assert.expect(1);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [
                {
                  metric: 'adClicks',
                  canonicalName: 'adClicks',
                  toJSON() {
                    return this;
                  }
                },
                {
                  metric: 'totalPageViews',
                  canonicalName: 'totalPageViews',
                  toJSON() {
                    return this;
                  }
                }
              ]
            }
          }
        }
      }
    });

    this.set('model', Model);
    await render(TEMPLATE);

    assert.dom('.c3-bar').exists({ count: 10 }, 'Ten bars are present in the bar based on the metrics in the request');
  });

  test('multiple dimension series', async function(assert) {
    assert.expect(2);

    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'dimension',
            config: {
              metric: {
                metric: 'totalPageViews',
                canonicalName: 'totalPageViews',
                toJSON() {
                  return this;
                }
              },
              dimensionOrder: ['age'],
              dimensions: [
                {
                  name: 'All Other',
                  values: { age: '-3' }
                },
                {
                  name: 'under 13',
                  values: { age: '1' }
                },
                {
                  name: '13 - 25',
                  values: { age: '2' }
                },
                {
                  name: '25 - 35',
                  values: { age: '3' }
                },
                {
                  name: '35 - 45',
                  values: { age: '4' }
                }
              ]
            }
          }
        }
      }
    });

    this.set('model', DimensionModel);

    await render(TEMPLATE);
    assert
      .dom('.c3-bars')
      .exists({ count: 5 }, 'Five series are present in the bar chart based on the dimension series in the request');

    assert
      .dom('.c3-bar')
      .exists({ count: 50 }, 'Fifty bars are present in the bar chart based on the dimension series in the request');
  });
});
