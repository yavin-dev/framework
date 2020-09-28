import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-data/utils/classes/interval';
import moment from 'moment';

module('Integration | Component | filter values/date range', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: [] };
    this.request = { logicalTable: { timeGrain: 'day', table: { timeGrainIds: ['day'] } } };
    this.onUpdateFilter = () => null;

    await render(hbs`<FilterValues::DateRange
            @filter={{this.filter}}
            @request={{this.request}}
            @onUpdateFilter={{this.onUpdateFilter}}
            @isCollapsed={{this.isCollapsed}}
        />`);
  });

  test('it renders', async function(assert) {
    assert.expect(4);

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Start', 'Placeholder text is present when no date range is selected');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('End', 'Placeholder text is present when no date range is selected');

    let selectedInterval = Interval.parseFromStrings('2019-11-29', '2019-12-06');
    this.set('filter', { values: A([selectedInterval]) });

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Nov 29, 2019', 'Placeholder text is inclusive start date');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Dec 05, 2019', 'Placeholder text is inclusive end date');
  });

  test('changing values', async function(assert) {
    assert.expect(2);

    const start = moment('2019-11-29');
    const end = moment('2019-12-06');
    let selectedInterval = new Interval(start, end);
    this.set('filter', { values: A([selectedInterval]) });

    // Click start date
    await click('.filter-values--date-range-input__low-value > .dropdown-date-picker__trigger');
    const newStartStr = '2019-11-28';

    this.set('onUpdateFilter', changeSet => {
      let expectedInterval = new Interval(moment(newStartStr), end);
      assert.ok(changeSet.interval.isEqual(expectedInterval), 'Updating start date works only updates start');
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

    const selectedInterval = Interval.parseFromStrings('P7D', '2020-01-10');
    this.set('filter', { values: A([selectedInterval]) });
    this.set('isCollapsed', true);

    assert.dom().hasText('Jan 03, 2020 - Jan 09, 2020', 'Selected range text is rendered correctly');

    this.set('filter', { values: null });

    assert.dom('.filter-values--selected-error').exists('Error is rendered when range is invalid');
  });
});
