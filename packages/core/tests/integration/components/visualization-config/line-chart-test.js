import { run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { get } from '@ember/object';

let Template = hbs`
  {{visualization-config/line-chart
    response=response
    request=request
    options=options
    onUpdateConfig=(action onUpdateConfig)
  }}`,
  chartOptions = {
    axis: {
      y: {
        series: {
          type: 'mock'
        }
      }
    }
  };

module('Integration | Component | visualization config/line chart', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    //mocking line chart type component
    this.owner.register(
      'component:visualization-config/chart-type/mock',
      Component.extend({
        classNames: ['mock'],
        click() {
          const handleUpdateConfig = get(this, 'onUpdateConfig');

          if (handleUpdateConfig) handleUpdateConfig(chartOptions);
        }
      }),
      { instantiate: false }
    );

    this.set('options', chartOptions);

    this.set('onUpdateConfig', () => null);
  });

  test('component renders', async function(assert) {
    assert.expect(1);

    await render(Template);
    assert.ok(
      this.$('.line-chart-config .mock').is(':visible'),
      'The Mock component is correctly rendered based on visualization type'
    );
  });

  test('onUpdateConfig', async function(assert) {
    assert.expect(1);

    this.set('onUpdateConfig', result => {
      assert.deepEqual(result, chartOptions, 'onUpdateConfig action is called by the mock component');
    });

    await render(Template);

    await run(() => click('.mock'));
  });
});
