import { next, run } from '@ember/runloop';
import Component from '@ember/component';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { initialize as injectC3Enhancements } from 'navi-core/initializers/inject-c3-enhancements';

module('Integration | Component | navi vis c3 chart', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    injectC3Enhancements();
  });

  test('resize', async function(assert) {
    let testContainer = Component.extend({
      classNames: ['test-container'],
      layout: hbs`{{yield this}}`
    });

    this.owner.register('component:test-container', testContainer);

    // Dummy data so chart won't complain
    this.set('data', {
      columns: [['data1', 30, 200, 100, 400, 150, 250]]
    });

    //Mock addObserver, that is used by ember-c3
    this.addObserver = () => null;

    await render(hbs`
      {{#test-container as |container|}}
        <div class='container' style='height: 100px'>
          {{navi-vis-c3-chart
            data=data
            containerComponent=container
          }}
        </div>
      {{/test-container}}
    `);

    run(() => {
      assert.dom('svg').hasAttribute('height', '100', 'chart fills height of container on initial render');

      find('.container').style.height = '200px';
    });

    await run(async () => {
      await triggerEvent('.test-container', 'resizestop');

      assert.dom('svg').hasAttribute('height', '200', 'chart height updates to match container after resize action');
    });
  });

  test('series classes', async function(assert) {
    assert.expect(2);

    this.set('data', {
      columns: [['series0', 30, 200, 100, 400, 150, 250], ['series1', 30, 200, 100, 400, 150, 250]]
    });

    await render(hbs`
      {{navi-vis-c3-chart
        data=data
        transition=0
      }}
    `);

    next(() => {
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
});
