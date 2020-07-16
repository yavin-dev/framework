import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

const TEMPLATE = hbs`
    {{navi-visualizations/apex-pie
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
          'age|description': 'All Other',
          uniqueIdentifier: 155191081,
          totalPageViews: 310382162,
          'revenue(currency=USD)': 200,
          'revenue(currency=CAD)': 300
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '1',
          'age|description': 'under 13',
          uniqueIdentifier: 55191081,
          totalPageViews: 2072620639,
          'revenue(currency=USD)': 300,
          'revenue(currency=CAD)': 256
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '2',
          'age|description': '13 - 25',
          uniqueIdentifier: 55191081,
          totalPageViews: 2620639,
          'revenue(currency=USD)': 400,
          'revenue(currency=CAD)': 5236
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '3',
          'age|description': '25 - 35',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 500,
          'revenue(currency=CAD)': 4321
        },
        {
          dateTime: '2015-12-14 00:00:00.000',
          'age|id': '4',
          'age|description': '35 - 45',
          uniqueIdentifier: 55191081,
          totalPageViews: 72620639,
          'revenue(currency=USD)': 600,
          'revenue(currency=CAD)': 132
        }
      ]
    }
  }
]);

const jeNeSaisPas = {
  type: 'dimension',
  config: {
    metric: {
      metric: 'totalPageViews'
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
};

let MetadataService;
const expectedInfo = {
  labels: ['All Other', 'under 13', '13 - 25', '25 - 35', '35 - 45'],
  totalPageViewData: [310382162, 2072620639, 2620639, 72620639, 72620639]
};

module('Integration | Components | Apex-Pie', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.set('model', Model);
    this.set('options', {
      type: 'pie-chart',
      version: 1,
      metadata: { series: jeNeSaisPas }
    });
    MetadataService = this.owner.lookup('service:bard-metadata');
    return MetadataService.loadMetadata();
  });

  test('legend of pie chart renders', async function(assert) {
    await this.render(TEMPLATE);
    let legendText = [];
    this.element.querySelectorAll('.apexcharts-legend-text').forEach(item => {
      legendText.push(item.textContent);
    });
    assert.deepEqual(legendText, expectedInfo.labels);
  });

  test('slices of pie chart render', async function(assert) {
    assert.expect(expectedInfo.totalPageViewData.length);
    await this.render(TEMPLATE);
    expectedInfo.totalPageViewData.forEach((item, index) => {
      assert.equal(this.element.querySelector(`.apexcharts-pie-slice-${index}`).getAttribute('data:value'), item);
    });
  });
});
