import { A as arr } from '@ember/array';
import { set } from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | goal gauge ', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    injectC3Enhancements();
    return this.owner.lookup('service:bard-metadata').loadMetadata();
  });

  test('goal-gauge renders correctly', async function(assert) {
    assert.expect(6);

    _setModel(this, 'pageViews', 3030000000);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
    {{navi-visualizations/goal-gauge
        model=model
        options=(hash
          baselineValue=290000000
          goalValue=310000000
          metric=metric
        )
      }}
    `);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('3.03B', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'the default metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('290M', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('310M', 'max gauge label is correctly displayed');

    assert.dom('.goal-title').hasText('310M Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge renders correctly with multi datasource', async function(assert) {
    assert.expect(1);
    const metaData = this.owner.lookup('service:bard-metadata');
    metaData._keg.reset();
    await metaData.loadMetadata({ dataSourceName: 'blockhead' });

    _setModel(this, 'available', 3030000000, 'blockhead');
    set(this, 'metric', { metric: 'available', parameters: {} });
    await render(hbs`
    <NaviVisualizations::GoalGauge
        @model={{this.model}}
        @options={{hash
          baselineValue=290000000
          goalValue=310000000
          metric=metric
        }}
      />
    `);

    assert.dom('.metric-title').hasText('How many are available', 'the default metric title is correctly displayed');
    metaData._keg.reset();
  });

  test('goal-gauge renders correctly with unit', async function(assert) {
    assert.expect(6);

    _setModel(this, 'pageViews', 75);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
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

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('75%', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('50%', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('100%', 'max gauge label is correctly displayed');

    assert.dom('.goal-title').hasText('100% Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge renders correctly with prefix', async function(assert) {
    assert.expect(6);

    _setModel(this, 'pageViews', 75);
    set(this, 'metric', { metric: 'pageViews', paramters: {} });
    await render(hbs`
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

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('$75', 'value title is correctly displayed');

    assert.dom('.metric-title').hasText('Page Views', 'metric title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('$50', 'min gauge label is correctly displayed with prefix');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('$100', 'max gauge label is correctly displayed with prefix');

    assert.dom('.goal-title').hasText('$100 Goal', 'goal title is correctly displayed');
  });

  test('goal-gauge title class is based on actualValue vs baselineValue', async function(assert) {
    assert.expect(3);

    _setModel(this, 'm1', 150);
    set(this, 'metric', { metric: 'm1', paramters: {} });
    await render(hbs`
      {{navi-visualizations/goal-gauge
        model=model
        options=(hash
          baselineValue=100
          goalValue=200
          metric=metric
        )
      }}
    `);
    assert.ok(!!findAll('.value-title.pos').length, 'pos class is added when actualValue is above baselineValue');

    _setModel(this, 'm1', 50);
    await render(hbs`
      {{navi-visualizations/goal-gauge
        model=model
        options=(hash
          baselineValue=100
          goalValue=200
          metric=metric
        )
      }}
    `);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue is below baselineValue');

    _setModel(this, 'm1', 100);
    await render(hbs`
      {{navi-visualizations/goal-gauge
        model=model
        options=(hash
          baselineValue=100
          goalValue=200
          metric=metric
        )
      }}
    `);
    assert.ok(!!findAll('.value-title.neg').length, 'neg class is added when actualValue equals baselineValue');
  });

  test('goal-guage with parameterized metric', async function(assert) {
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

    await render(hbs`
        {{navi-visualizations/goal-gauge
        model=model
        options=options
      }}
    `);

    assert.dom('.c3-chart-component svg').exists('gauge component renders');

    assert.dom('.value-title').hasText('300', 'value title is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('200', 'min gauge label is correctly displayed');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('500', 'max gauge label is correctly displayed');

    assert.dom('.metric-title').hasText('Revenue (USD)', 'parameterized metric title is correctly displayed');
  });

  test('goal-gauge value & min/max precision', async function(assert) {
    assert.expect(6);

    _setModel(this, 'm1', 1234567);
    this.set('options', {
      baselineValue: 1234567,
      goalValue: 1234567,
      metric: { metric: 'm1', parameters: {} }
    });

    await render(hbs`
      {{navi-visualizations/goal-gauge
        model=model
        options=options
      }}
    `);

    assert.dom('.value-title').hasText('1.23M', 'value title has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('1.23M', 'min gauge label has a precision of 2 when under 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('1.23M', 'max gauge label has a precision of 2 when under 1B');

    _setModel(this, 'm1', 9123456789);
    this.set('options', {
      baselineValue: 9123456789,
      goalValue: 9123456789,
      metric: { metric: 'm1', parameters: {} }
    });

    await render(hbs`
      {{navi-visualizations/goal-gauge
        model=model
        options=options
      }}
    `);

    assert.dom('.value-title').hasText('9.123B', 'value title has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-min').hasText('9.123B', 'min gauge label has a precision of 3 when over 1B');

    assert.dom('.c3-chart-arcs-gauge-max').hasText('9.123B', 'max gauge label has a precision of 3 when over 1B');
  });

  test('goal-gauge renders custom metric title', async function(assert) {
    assert.expect(1);

    _setModel(this, 'm1', 75);
    set(this, 'metric', { metric: 'm1', paramters: {} });
    set(this, 'metricTitle', 'A real good metric');

    await render(hbs`
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

    assert.dom('.metric-title').hasText(this.get('metricTitle'), 'custom metric title is correctly displayed');
  });

  test('cleanup', async function(assert) {
    assert.expect(2);

    _setModel(this, 'm1', 75);
    set(this, 'metric', { metric: 'm1', paramters: {} });

    this.set('metricTitle', 'A real good metric');

    await render(hbs`
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

    assert
      .dom('text.c3-chart-arcs-title > tspan')
      .exists({ count: 3 }, 'on initial render, 3 title tspans are present');

    this.set('metricTitle', 'A real great metric');

    assert
      .dom('text.c3-chart-arcs-title > tspan')
      .exists({ count: 3 }, 'on rerender render, 3 title tspans are present');
  });

  /**
   * Set the test context model property with a model object
   * @function _setModel
   * @param {Object} context - test context
   * @param {String} metric - metric name
   * @param {Number} value - value of metric
   * @return {Void}
   */
  function _setModel(context, metric, value, dataSource = 'dummy') {
    context.set(
      'model',
      arr([
        {
          response: { rows: [{ [metric]: value }] },
          request: { metrics: [{ metric }], dataSource }
        }
      ])
    );
  }
});
