import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';

moduleForComponent('navi-vis-c3-chart', 'Integration | Component | navi vis c3 chart', {
  integration: true,
  beforeEach() {
    injectC3Enhancements();
  }
});

test('resize', function(assert) {
  let testContainer = Ember.Component.extend({
    classNames: ['test-container'],
    layout: hbs`{{yield this}}`
  });

  this.register('component:test-container', testContainer);

  // Dummy data so chart won't complain
  this.set('data', {
    columns: [['data1', 30, 200, 100, 400, 150, 250]]
  });

  //Mock addObserver, that is used by ember-c3
  this.addObserver = () => null;

  this.render(hbs`
    {{#test-container as |container|}}
      <div class='container' style='height: 100px'>
        {{navi-vis-c3-chart
          data=data
          containerComponent=container
        }}
      </div>
    {{/test-container}}
  `);

  Ember.run.next(() => {
    assert.equal(this.$('svg').css('height'), '100px', 'chart fills height of container on initial render');

    this.$('.container').css('height', '200px');

    Ember.run(() => {
      this.$('.test-container').trigger('resizestop');
    });

    assert.equal(this.$('svg').css('height'), '200px', 'chart height updates to match container after resize action');
  });
});

test('series classes', function(assert) {
  assert.expect(2);

  this.set('data', {
    columns: [['series0', 30, 200, 100, 400, 150, 250], ['series1', 30, 200, 100, 400, 150, 250]]
  });

  this.render(hbs`
    {{navi-vis-c3-chart
      data=data
      transition=0
    }}
  `);

  Ember.run.next(() => {
    assert.ok(
      this.$('.c3-chart-line:eq(0)').is('.chart-series-0'),
      'Each chart series has a corresponding class applied'
    );

    assert.ok(
      this.$('.c3-chart-line:eq(1)').is('.chart-series-1'),
      'Each chart series has a corresponding class applied'
    );
  });
});
