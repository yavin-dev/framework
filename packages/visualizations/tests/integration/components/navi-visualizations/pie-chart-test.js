import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements} from 'navi-visualizations/initializers/inject-c3-enhancements';

const TEMPLATE = hbs`
    {{navi-visualizations/pie-chart
        model=model
        options=options
    }}`;

const Model = Ember.A([{
  request: {
    logicalTable: {
      timeGrain: {
        name: 'day'
      }
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
          name: 'totalPageViews',
          longName: 'Total Page Views'
        }
      },
      {
        metric: {
          name: 'uniqueIdentifier',
          longName: 'Unique Identifier'
        }
      }
    ],
    dimensions: [{
      dimension: {
        name: 'age',
        longName: 'Age'
      }
    }]
  },
  response: {
    rows: [
      {
        "dateTime": "2015-12-14 00:00:00.000",
        "age|id": "-3",
        "age|desc": "All Other",
        "uniqueIdentifier": 155191081,
        "totalPageViews": 3072620639
      },
      {
        "dateTime": "2015-12-14 00:00:00.000",
        "age|id": "1",
        "age|desc": "under 13",
        "uniqueIdentifier": 55191081,
        "totalPageViews": 2072620639
      },
      {
        "dateTime": "2015-12-14 00:00:00.000",
        "age|id": "2",
        "age|desc": "13 - 25",
        "uniqueIdentifier": 55191081,
        "totalPageViews": 2620639
      },
      {
        "dateTime": "2015-12-14 00:00:00.000",
        "age|id": "3",
        "age|desc": "25 - 35",
        "uniqueIdentifier": 55191081,
        "totalPageViews": 72620639
      },
      {
        "dateTime": "2015-12-14 00:00:00.000",
        "age|id": "4",
        "age|desc": "35 - 45",
        "uniqueIdentifier": 55191081,
        "totalPageViews": 72620639
      }
    ]
  }
}]);

moduleForComponent('navi-visualizations/pie-chart', 'Integration | Component | pie chart', {
  integration: true,
  beforeEach() {
    injectC3Enhancements();
    this.set('model', Model);
  }
});

test('it renders', function(assert) {
  assert.expect(4);

  this.set('options', {
    series: {
      config: {
        type: 'dimension',
        metric: 'totalPageViews',
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: {age: '-3'}
          },
          {
            name: 'Under 13',
            values: {age: '1'}
          }
        ]
      }
    }
  });
  this.render(TEMPLATE);

  assert.ok(this.$('.navi-vis-c3-chart').is(':visible'),
    'The pie chart widget component is visible');

  assert.equal(this.$('.c3-chart-arc').length,
    2,
    'Two pie slices are present on the chart');

  assert.equal(this.$('.c3-target-All-Other text').text().trim(),
    '59.72%',
    'Percentage label shown on slice is formatted properly for `All Other`');

  assert.equal(this.$('.c3-target-Under-13 text').text().trim(),
    '40.28%',
    'Percentage label shown on slice is formatted properly for `Under 13`');
});

test('metric label', function(assert) {
  assert.expect(6);

  this.set('options', {
    series: {
      config: {
        type: 'dimension',
        metric: 'totalPageViews',
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: {age: '-3'}
          },
          {
            name: 'Under 13',
            values: {age: '1'}
          }
        ]
      }
    }
  });

  this.render(TEMPLATE);

  assert.equal(this.$('.c3-title').text(),
    'totalPageViews',
    'The metric name is displayed in the metric label correctly');

  //Calulate where the metric label should be relative to the pie chart
  let chartElm = this.$('.c3-chart-arcs'),
      xTranslate  = d3.transform(chartElm.attr('transform')).translate[0] - (chartElm[0].getBoundingClientRect().width / 2) - 50,
      yTranslate  = this.$('svg').css('height').replace('px', '') / 2;

  assert.equal(Math.round(d3.transform(this.$('.c3-title').attr('transform')).translate[0]),
    Math.round(xTranslate),
    'The metric name is in the correct X position on initial render');

  assert.equal(Math.round(d3.transform(this.$('.c3-title').attr('transform')).translate[1]),
    Math.round(yTranslate),
    'The metric name is in the correct Y position on initial render');

  /*
   * Resize the parent element of the SVG that the pie chart is drawn in
   * This effectively moves the pie chart to the left
   */
  this.$('.pie-chart-widget').css('max-width', '1000px');

  //Rerender with a new metric and new chart position
  this.set('options', {
    series: {
      config: {
        type: 'dimension',
        metric: 'uniqueIdentifier',
        dimensionOrder: ['age'],
        dimensions: [
          {
            name: 'All Other',
            values: {age: '-3'}
          },
          {
            name: 'Under 13',
            values: {age: '1'}
          }
        ]
      }
    }
  });

  //Recalculate these after the chart is rerendered
  chartElm = this.$('.c3-chart-arcs');
  xTranslate = d3.transform(chartElm.attr('transform')).translate[0] - (chartElm[0].getBoundingClientRect().width / 2) - 50;
  yTranslate = this.$('svg').css('height').replace('px', '') / 2;

  assert.equal(this.$('.c3-title').text(),
    'uniqueIdentifier',
    'The metric label is updated after the metric is changed');

  assert.equal(Math.round(d3.transform(this.$('.c3-title').attr('transform')).translate[0]),
    Math.round(xTranslate),
    'The metric name is in the correct X position after the pie chart moves');

  assert.equal(Math.round(d3.transform(this.$('.c3-title').attr('transform')).translate[1]),
    Math.round(yTranslate),
    'The metric name is in the correct Y position after the pie chart moves');
});
