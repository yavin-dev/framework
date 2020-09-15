import { setupRenderingTest } from 'ember-qunit';
import { A } from '@ember/array';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { assignColors } from 'navi-core/utils/enums/denali-colors';
import Component from '@ember/component';
import { run } from '@ember/runloop';
import { triggerEvent } from '@ember/test-helpers';

const TEMPLATE = hbs`
<NaviVisualizations::ApexPie
  @model={{this.model}}
  @options={{this.options}}
  @containerComponent={{this.containerComponent}}
/>`;

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
          metric: 'totalPageViews'
        },
        {
          metric: 'uniqueIdentifier'
        }
      ],
      dimensions: [
        {
          dimension: 'age'
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

const seriesInfo = {
  series: {
    config: {
      colors: assignColors(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], []),
      dataLabelsVisible: true,
      legendVisible: true,
      metrics: [
        {
          id: 'totalPageViews',
          name: 'TotalPageViews'
        },
        {
          id: 'uniqueIdentifier',
          name: 'UniqueIdentifier'
        }
      ],
      dimensions: [
        {
          id: 'age',
          name: 'Age'
        }
      ]
    }
  }
};

const expectedInfo = {
  labels: ['All Other', 'under 13', '13 - 25', '25 - 35', '35 - 45'],
  totalPageViewData: ['310382162', '2072620639', '2620639', '72620639', '72620639']
};

module('Integration | Components | Apex-Pie', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    this.set('model', Model);
    this.set('options', seriesInfo);
    this.set('containerComponent', null);
    await this.owner.lookup('service:bard-metadata');
  });

  test('legend of apex-pie chart renders', async function(assert) {
    assert.expect(3);
    await this.render(TEMPLATE);
    assert
      .dom('.apexcharts-legend-series')
      .exists({ count: expectedInfo.labels.length }, 'all slice data renders in legend');
    assert.dom('.apexcharts-legend-text').hasAttribute('data:default-text');
    let legendText = [];
    this.element.querySelectorAll('.apexcharts-legend-text').forEach(item => {
      legendText.push(item.textContent);
    });
    assert.deepEqual(legendText, expectedInfo.labels, 'legend renders with correct labels for all slices');
  });

  test('slices of apex-pie chart render with correct values', async function(assert) {
    assert.expect(expectedInfo.totalPageViewData.length + 1);
    await this.render(TEMPLATE);
    assert.dom('.apexcharts-pie-series').exists({ count: 5 }, 'all slices of pie chart render');
    expectedInfo.totalPageViewData.forEach((item, index) => {
      assert
        .dom(`.apexcharts-pie-slice-${index}`)
        .hasAttribute('data:value', item, 'pie chart slices have correct values');
    });
  });

  test('size automatically calculates to match smaller of width/height', async function(assert) {
    assert.expect(3);
    let testContainer = Component.extend({
      classNames: ['visualization-container'],
      layout: hbs`{{yield this}}`
    });
    this.owner.register('component:test-container', testContainer);
    await this.render(hbs`
      {{#test-container as |test-container|}}
      <div class='test-view'>
        <div class='test-view__visualization-container' style={{'height:600px; width:900px;'}}>
          <NaviVisualizations::ApexPie
            @model={{this.model}}
            @options={{this.options}}
            @containerComponent={{test-container}}
          />
        </div>
      </div>
      {{/test-container}}`);
    assert.dom('.apexcharts-canvas').exists();
    assert
      .dom('.apexcharts-canvas')
      .hasStyle(
        { height: '557.188px', width: '900px' },
        'container in landscape orientation, chart auto-computes closest possible to 100% height'
      );
    this.$('.test-view__visualization-container')[0].style.height = '900px';
    this.$('.test-view__visualization-container')[0].style.width = '600px';
    await run(async () => {
      await triggerEvent('.visualization-container', 'resizestop');
    });
    assert
      .dom('.apexcharts-canvas')
      .hasStyle(
        { height: '457.188px', width: '600px' },
        'container in portrait orientation, chart auto-computes closest posible to 100% width'
      );
  });
});
