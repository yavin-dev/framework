import { run } from '@ember/runloop';
import Component from '@ember/component';
import { moduleForComponent, test } from 'ember-qunit';
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

moduleForComponent('visualization-config/line-chart', 'Integration | Component | visualization config/line chart', {
  integration: true,
  beforeEach() {
    //mocking line chart type component
    this.register(
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
  }
});

test('component renders', function(assert) {
  assert.expect(1);

  this.render(Template);
  assert.ok(
    this.$('.line-chart-config .mock').is(':visible'),
    'The Mock component is correctly rendered based on visualization type'
  );
});

test('onUpdateConfig', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.deepEqual(result, chartOptions, 'onUpdateConfig action is called by the mock component');
  });

  this.render(Template);

  run(() => {
    this.$('.mock').click();
  });
});
