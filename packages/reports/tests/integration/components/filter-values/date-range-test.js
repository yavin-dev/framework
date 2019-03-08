import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Duration from 'navi-core/utils/classes/duration';
import Interval from 'navi-core/utils/classes/interval';

moduleForComponent('filter-values/date-range', 'Integration | Component | filter values/date range', {
  integration: true,

  beforeEach: function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;

    this.render(hbs`{{filter-values/date-range
            filter=filter
            request=request
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  }
});

test('it renders', function(assert) {
  assert.expect(3);

  assert.equal(
    this.$('.date-range__select-trigger')
      .text()
      .trim(),
    'Select date range',
    'Placeholder text is present when no date range is selected'
  );

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

  assert.equal(
    this.$('.date-range__select-trigger')
      .text()
      .trim(),
    'Last 7 Days',
    'Trigger text is updated with selected interval'
  );
});

test('changing values', function(assert) {
  assert.expect(1);

  this.set('onUpdateFilter', changeSet => {
    let expectedInterval = new Interval(new Duration('P7D'), 'current');
    assert.ok(changeSet.interval.isEqual(expectedInterval), 'Selected interval is given to update action');
  });

  this.$('.predefined-range:contains(Last 7 Days)').click();
});
