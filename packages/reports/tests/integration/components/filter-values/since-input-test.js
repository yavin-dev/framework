import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-data/utils/classes/interval';
import { getDateRangeFormat } from '../../../helpers/get-date-range';

module('Integration | Component | filter values/since input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('2020-01-01', 'current')]) };
    this.request = { logicalTable: { timeGrain: 'day', table: { timeGrainIds: ['day'] } } };
    this.onUpdateFilter = () => null;

    await render(hbs`<FilterValues::SinceInput
      @filter={{this.filter}}
      @request={{this.request}}
      @onUpdateFilter={{this.onUpdateFilter}}
      @isCollapsed={{this.isCollapsed}}
    />`);
  });

  test('it renders', function(assert) {
    assert.expect(3);

    assert
      .dom('.filter-values--since-input')
      .hasText('Jan 01, 2020 Exclude current day?', 'The since input shows the start date and checkbox');
    assert
      .dom('.filter-values--since-input__low-value')
      .hasText('Jan 01, 2020', 'The low value is the correct start date');
    assert.dom('#currentDateTimePeriod').isChecked('The interval does not include next');
  });

  test('changing values', async function(assert) {
    assert.expect(3);

    const originalRange = getDateRangeFormat(this);
    this.set('onUpdateFilter', ({ interval }) => {
      this.set('filter', { values: arr([interval]) });
    });

    await click('#currentDateTimePeriod');
    const newRange = getDateRangeFormat(this);
    assert.notEqual(originalRange, newRange, 'The interval changed');
    assert.dom('#currentDateTimePeriod').isNotChecked('The interval includes next');

    await click('.filter-values--since-input__low-value > .dropdown-date-picker__trigger');
    await click('.ember-power-calendar-day--current-month[data-date="2020-01-03"]');
    assert
      .dom('.filter-values--since-input')
      .hasText('Jan 03, 2020 Exclude current day?', 'The start date changes to Jan 3');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--since-input').doesNotExist('The since input does not display when collapsed');
    assert.dom().hasText(`${getDateRangeFormat(this)}`, 'The since input is rendered correctly when collapsed');
  });
});
