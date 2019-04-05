import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';

module('Integration | Component | filter values/date range', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;

    await render(hbs`{{filter-values/date-range
            filter=filter
            request=request
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(3);

    assert
      .dom('.date-range__select-trigger')
      .hasText('Select date range', 'Placeholder text is present when no date range is selected');

    assert.deepEqual(
      this.$('.predefined-range')
        .map(function() {
          return $(this)
            .text()
            .trim();
        })
        .get(),
      [
        'Last Day',
        'Last 7 Days',
        'Last 14 Days',
        'Last 30 Days',
        'Last 60 Days',
        'Last 90 Days',
        'Last 180 Days',
        'Last 400 Days'
      ],
      'Predefined ranges are set based on the request time grain'
    );

    run(() => {
      let selectedInterval = new Interval(new Duration('P7D'), 'current');
      this.set('filter', { values: A([selectedInterval]) });
    });

    assert.dom('.date-range__select-trigger').hasText('Last 7 Days', 'Trigger text is updated with selected interval');
  });

  test('changing values', function(assert) {
    assert.expect(1);

    this.set('onUpdateFilter', changeSet => {
      let expectedInterval = new Interval(new Duration('P7D'), 'current');
      assert.ok(changeSet.interval.isEqual(expectedInterval), 'Selected interval is given to update action');
    });

    this.$('.predefined-range:contains(Last 7 Days)').click();
  });
});
