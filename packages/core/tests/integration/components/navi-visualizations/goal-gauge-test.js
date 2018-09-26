import { A as arr } from '@ember/array';
import { getOwner } from '@ember/application';
import { set } from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

moduleForComponent('goal-gauge', 'Integration | Component | goal gauge ', {
  integration: true,

  beforeEach() {
    injectC3Enhancements();
    this.server = startMirage();
    return getOwner(this)
      .lookup('service:bard-metadata')
      .loadMetadata();
  },

  afterEach() {
    return this.server.shutdown();
  }
});

test('goal-gauge renders correctly', function(assert) {
  assert.expect(6);

  _setModel(this, 'pageViews', 3030000000);
  set(this, 'metric', { metric: 'pageViews', paramters: {} });
  this.render(hbs`
  {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=290000000
        goalValue=310000000
        metric=metric
      )
    }}
  `);

  assert.ok(!!this.$('.c3-chart-component c3 svg'), 'gauge component renders');

  assert.equal(this.$('.value-title').text(), '3.03B', 'value title is correctly displayed');

  assert.equal(this.$('.metric-title').text(), 'Page Views', 'the default metric title is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-min').text(), '290M', 'min gauge label is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-max').text(), '310M', 'max gauge label is correctly displayed');

  assert.equal(
    this.$('.goal-title')
      .text()
      .trim(),
    '310M Goal',
    'goal title is correctly displayed'
  );
});

test('goal-gauge renders correctly with unit', function(assert) {
  assert.expect(6);

  _setModel(this, 'pageViews', 75);
  set(this, 'metric', { metric: 'pageViews', paramters: {} });
  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=50
        goalValue=100
        unit='%'
        metric=metric
      )
    }}
  `);

  assert.ok(!!this.$('.c3-chart-component c3 svg'), 'gauge component renders');

  assert.equal(this.$('.value-title').text(), '75%', 'value title is correctly displayed');

  assert.equal(this.$('.metric-title').text(), 'Page Views', 'metric title is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-min').text(), '50%', 'min gauge label is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-max').text(), '100%', 'max gauge label is correctly displayed');

  assert.equal(
    this.$('.goal-title')
      .text()
      .trim(),
    '100% Goal',
    'goal title is correctly displayed'
  );
});

test('goal-gauge renders correctly with prefix', function(assert) {
  assert.expect(6);

  _setModel(this, 'pageViews', 75);
  set(this, 'metric', { metric: 'pageViews', paramters: {} });
  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=50
        goalValue=100
        prefix='$'
        metric=metric
      )
    }}
  `);

  assert.ok(!!this.$('.c3-chart-component c3 svg'), 'gauge component renders');

  assert.equal(this.$('.value-title').text(), '$75', 'value title is correctly displayed');

  assert.equal(this.$('.metric-title').text(), 'Page Views', 'metric title is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-min').text(), '$50', 'min gauge label is correctly displayed with prefix');

  assert.equal(this.$('.c3-chart-arcs-gauge-max').text(), '$100', 'max gauge label is correctly displayed with prefix');

  assert.equal(
    this.$('.goal-title')
      .text()
      .trim(),
    '$100 Goal',
    'goal title is correctly displayed'
  );
});

test('goal-gauge title class is based on actualValue vs baselineValue', function(assert) {
  assert.expect(3);

  _setModel(this, 'm1', 150);
  set(this, 'metric', { metric: 'm1', paramters: {} });
  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=100
        goalValue=200
        metric=metric
      )
    }}
  `);
  assert.ok(!!this.$('.value-title.pos').length, 'pos class is added when actualValue is above baselineValue');

  _setModel(this, 'm1', 50);
  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=100
        goalValue=200
        metric=metric
      )
    }}
  `);
  assert.ok(!!this.$('.value-title.neg').length, 'neg class is added when actualValue is below baselineValue');

  _setModel(this, 'm1', 100);
  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=100
        goalValue=200
        metric=metric
      )
    }}
  `);
  assert.ok(!!this.$('.value-title.neg').length, 'neg class is added when actualValue equals baselineValue');
});

test('goal-guage with parameterized metric', function(assert) {
  this.set(
    'model',
    arr([
      {
        response: {
          rows: [
            {
              'revenue(currency=USD)': '300'
            }
          ]
        },
        request: {
          metrics: [
            {
              metric: 'revenue',
              parameters: {
                currency: 'USD'
              }
            }
          ]
        }
      }
    ])
  );
  this.set('options', {
    baselineValue: 200,
    goalValue: 500,
    metric: { metric: 'revenue', parameters: { currency: 'USD' } }
  });

  this.render(hbs`
      {{navi-visualizations/goal-gauge
      model=model
      options=options
    }}
  `);

  assert.ok(!!this.$('.c3-chart-component c3 svg'), 'gauge component renders');

  assert.equal(this.$('.value-title').text(), '300', 'value title is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-min').text(), '200', 'min gauge label is correctly displayed');

  assert.equal(this.$('.c3-chart-arcs-gauge-max').text(), '500', 'max gauge label is correctly displayed');

  assert.equal(this.$('.metric-title').text(), 'Revenue (USD)', 'parameterized metric title is correctly displayed');
});

test('goal-gauge value & min/max precision', function(assert) {
  assert.expect(6);

  _setModel(this, 'm1', 1234567);
  this.set('options', {
    baselineValue: 1234567,
    goalValue: 1234567,
    metric: { metric: 'm1', parameters: {} }
  });

  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=options
    }}
  `);

  assert.equal(this.$('.value-title').text(), '1.23M', 'value title has a precision of 2 when under 1B');

  assert.equal(
    this.$('.c3-chart-arcs-gauge-min').text(),
    '1.23M',
    'min gauge label has a precision of 2 when under 1B'
  );

  assert.equal(
    this.$('.c3-chart-arcs-gauge-max').text(),
    '1.23M',
    'max gauge label has a precision of 2 when under 1B'
  );

  _setModel(this, 'm1', 9123456789);
  this.set('options', {
    baselineValue: 9123456789,
    goalValue: 9123456789,
    metric: { metric: 'm1', parameters: {} }
  });

  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=options
    }}
  `);

  assert.equal(this.$('.value-title').text(), '9.123B', 'value title has a precision of 3 when over 1B');

  assert.equal(
    this.$('.c3-chart-arcs-gauge-min').text(),
    '9.123B',
    'min gauge label has a precision of 3 when over 1B'
  );

  assert.equal(
    this.$('.c3-chart-arcs-gauge-max').text(),
    '9.123B',
    'max gauge label has a precision of 3 when over 1B'
  );
});

test('goal-gauge renders custom metric title', function(assert) {
  assert.expect(1);

  _setModel(this, 'm1', 75);
  set(this, 'metric', { metric: 'm1', paramters: {} });
  set(this, 'metricTitle', 'A real good metric');

  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=50
        goalValue=100
        metric=metric
        metricTitle=metricTitle
      )
    }}
  `);

  assert.equal(this.$('.metric-title').text(), this.get('metricTitle'), 'custom metric title is correctly displayed');
});

test('cleanup', function(assert) {
  assert.expect(2);

  _setModel(this, 'm1', 75);
  set(this, 'metric', { metric: 'm1', paramters: {} });

  this.set('metricTitle', 'A real good metric');

  this.render(hbs`
    {{navi-visualizations/goal-gauge
      model=model
      options=(hash
        baselineValue=50
        goalValue=100
        metric=metric
        metricTitle=metricTitle
      )
    }}
  `);

  assert.equal(this.$('text.c3-chart-arcs-title > tspan').length, 3, 'on initial render, 3 title tspans are present');

  this.set('metricTitle', 'A real great metric');

  assert.equal(this.$('text.c3-chart-arcs-title > tspan').length, 3, 'on rerender render, 3 title tspans are present');
});

/**
 * Set the test context model property with a model object
 * @function _setModel
 * @param {Object} context - test context
 * @param {String} metric - metric name
 * @param {Number} value - value of metric
 * @return {Void}
 */
function _setModel(context, metric, value) {
  context.set(
    'model',
    arr([
      {
        response: { rows: [{ [metric]: value }] },
        request: { metrics: [{ metric }] }
      }
    ])
  );
}
