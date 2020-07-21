import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

let MetadataService;

const TEMPLATE = hbs`
  {{navi-visualizations/apex-bar
    model=model
    options=options
  }}`;

const Model = A([
  {
    request: {
      metrics: ['uniqueIdentifier', 'totalPageViews', 'revenue(currency=USD)'],
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
          totalPageViews: 3669828357,
          'revenue(currency=USD)': 2000323439.23
        },
        {
          dateTime: '2016-05-31 00:00:00.000',
          uniqueIdentifier: 183206656,
          totalPageViews: 4088487125,
          'revenue(currency=USD)': 1999243823.74
        },
        {
          dateTime: '2016-06-01 00:00:00.000',
          uniqueIdentifier: 183380921,
          totalPageViews: 4024700302,
          'revenue(currency=USD)': 1400324934.92
        },
        {
          dateTime: '2016-06-02 00:00:00.000',
          uniqueIdentifier: 180559793,
          totalPageViews: 3950276031,
          'revenue(currency=USD)': 923843934.11
        },
        {
          dateTime: '2016-06-03 00:00:00.000',
          uniqueIdentifier: 172724594,
          'revenue(currency=USD)': 1623430236.42
        }
      ]
    }
  }
]);

const expectedInfo = {
  series: Model[0].request.metrics,
  dates: ['May 30', 'May 31', 'Jun 1', 'Jun 2', 'Jun 3'],
  uniqueIdentifierData: [172933788, 183206656, 183380921, 180559793, 172724594],
  totalPageViewData: [3669828357, 4088487125, 4024700302, 3950276031],
  revenueData: [2000323439.23, 1999243823.74, 1400324934.92, 923843934.11, 1623430236.42]
};

module('Integration | Component | Apex-Bar', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.set('model', Model);
    this.set('options', {
      axis: {
        y: {
          series: {
            type: 'metric',
            config: {
              metrics: [
                {
                  metric: 'uniqueIdentifier',
                  canonicalName: 'uniqueIdentifier',
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
    MetadataService._keg.reset();
  });

  test('apex-bar chart legend renders', async function(assert) {
    await this.render(TEMPLATE);
    let legendText = [];
    this.element.querySelectorAll('.apexcharts-legend-text').forEach(item => {
      legendText.push(item.textContent);
    });
    assert.deepEqual(legendText, expectedInfo.series);
  });

  test('apex-bar chart x-axis dates render', async function(assert) {
    await this.render(TEMPLATE);
    let legendText = [];
    this.element.querySelectorAll('.apexcharts-xaxis-texts-g title').forEach(item => {
      legendText.push(item.textContent);
    });
    assert.deepEqual(legendText, expectedInfo.dates);
  });

  test('apex-bar chart bars render', async function(assert) {
    await this.render(TEMPLATE);
    assert.dom('.apexcharts-bar-series').exists();
    const numBars =
      expectedInfo.series.length *
      Math.max(
        expectedInfo.uniqueIdentifierData.length,
        expectedInfo.totalPageViewData.length,
        expectedInfo.revenueData.length
      );
    assert.dom('.apexcharts-bar-area').exists({ count: numBars });
  });
});
