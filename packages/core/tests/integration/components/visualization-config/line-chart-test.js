import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

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
    this.register('component:visualization-config/chart-type/mock',
      Ember.Component.extend({
        classNames: [ 'mock' ],
        click(){
          this.sendAction('onUpdateConfig', chartOptions);
        }
      }), {instantiate: false}
    );

    this.set('options', chartOptions);

    this.set('onUpdateConfig', () => null);
  }
});

test('component renders', function(assert) {
  assert.expect(1);

  this.render(Template);
  assert.ok(this.$('.line-chart-config .mock').is(':visible'),
    'The Mock component is correctly rendered based on visualization type');
});

test('onUpdateConfig', function(assert) {
  assert.expect(1);

  this.set('onUpdateConfig', result => {
    assert.deepEqual(result,
      chartOptions,
      'onUpdateConfig action is called by the mock component');
  });

  this.render(Template);

  Ember.run(() => {
    this.$('.mock').click();
  });
});
