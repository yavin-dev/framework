import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import moment from 'moment';

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
            isCollapsed=isCollapsed
        }}`);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Start', 'Placeholder text is present when no date range is selected');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Before', 'Placeholder text is present when no date range is selected');

    run(() => {
      let selectedInterval = new Interval(moment('11-29-2019'), moment('12-06-2019'));
      this.set('filter', { values: A([selectedInterval]) });
    });

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Nov 29, 2019', 'Placeholder text is inclusive start date');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Dec 05, 2019', 'Placeholder text is inclusive end date');
  });

  test('changing values', async function(assert) {
    assert.expect(2);

    const start = moment('11-29-2019');
    const end = moment('12-06-2019');
    run(() => {
      let selectedInterval = new Interval(start, end);
      this.set('filter', { values: A([selectedInterval]) });
    });

    // Click start date
    await click('.filter-values--date-range-input__low-value > .dropdown-date-picker__trigger');
    const newStartStr = '2019-11-28';

    this.set('onUpdateFilter', changeSet => {
      let expectedInterval = new Interval(moment(newStartStr), end);
      assert.ok(changeSet.interval.isEqual(expectedInterval), 'Updating start date works');
      this.set('filter', { values: A([changeSet.interval]) });
    });

    await click(`.ember-power-calendar-day[data-date="${newStartStr}"]`);

    // Click end date
    await click('.filter-values--date-range-input__high-value > .dropdown-date-picker__trigger');
    const newEndStr = '2019-12-07';

    this.set('onUpdateFilter', changeSet => {
      let expectedInterval = new Interval(moment(newStartStr), moment(newEndStr).add(1, 'day'));
      assert.ok(changeSet.interval.isEqual(expectedInterval), 'Updating inclusive end date adds extra day');
      this.set('filter', { values: A([changeSet.interval]) });
    });

    await click(`.ember-power-calendar-day[data-date="${newEndStr}"]`);
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    const selectedInterval = new Interval(new Duration('P7D'), 'current');
    this.set('filter', { values: A([selectedInterval]) });
    this.set('isCollapsed', true);

    assert.dom().hasText('Last 7 Days', 'Selected range text is rendered correctly');

    this.set('filter', { values: null });

    assert
      .dom('.filter-values--date-range .filter-values--selected-error')
      .exists('Error is rendered when range is invalid');
  });
});
