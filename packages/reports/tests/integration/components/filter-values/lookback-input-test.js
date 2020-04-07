import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerEvent, click, findAll } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import { getDateRangeFormat } from './date-range-test';
import { clickTrigger } from 'ember-basic-dropdown/test-support/helpers';
import $ from 'jquery';

module('Integration | Component | filter values/lookback input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('P4D', 'current')]) };
    this.request = { logicalTable: { timeGrain: 'day', table: { timeGrainIds: ['day'] } } };
    this.onUpdateFilter = () => null;

    await render(hbs`<FilterValues::LookbackInput
            @filter={{this.filter}}
            @request={{this.request}}
            @onUpdateFilter={{this.onUpdateFilter}}
            @isCollapsed={{this.isCollapsed}}
        />`);
  });

  test('it renders', function(assert) {
    assert.expect(2);

    assert
      .dom('.filter-values--lookback-input')
      .hasText(`days (${getDateRangeFormat(this)})`, 'The dateTimePeriod and concrete interval are displayed');
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('4', 'The input value is the number of days to look back');
  });

  test('changing values', async function(assert) {
    assert.expect(3);

    const originalRange = getDateRangeFormat(this);
    this.set('onUpdateFilter', ({ interval }) => {
      this.set('filter', { values: arr([interval]) });
    });
    await fillIn('.filter-values--lookback-input__value', '5');
    await triggerEvent('.filter-values--lookback-input__value', 'keyup');
    const newRange = getDateRangeFormat(this);
    assert.notEqual(originalRange, newRange, 'The interval changed');
    assert
      .dom('.filter-values--lookback-input')
      .hasText(`days (${newRange})`, 'The dateTimePeriod and concrete interval are displayed');
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('5', 'The input value changed along with the interval');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--lookback-input').doesNotExist('The lookback input does not display when collapsed');
    assert.dom().hasText(`4 days (${getDateRangeFormat(this)})`, 'The lookback is rendered correctly when collapsed');
  });

  test('selecting preset values', async function(assert) {
    assert.expect(4);

    this.set('onUpdateFilter', filter => {
      this.set('filter', { values: arr([filter.interval]) });
    });

    // Set to 7
    await clickTrigger('.filter-values--lookback-input');
    await click($('.navi-basic-dropdown-option:contains(7)')[0]);
    assert.dom('.filter-values--lookback-input__value').hasValue('7', 'Clicking last 7 days changes input value to 7');

    // Only 7 is selected
    await clickTrigger('.filter-values--lookback-input');
    assert.deepEqual(getSelectedOptions(), ['7 Days'], '7 is the only selected option after being clicked');
    await clickTrigger('.filter-values--lookback-input');

    // Set to 30
    await clickTrigger('.filter-values--lookback-input');
    await click($('.navi-basic-dropdown-option:contains(30)')[0]);
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('30', 'Clicking last 30 days changes input value to 30');

    // Only 30 is selected
    await clickTrigger('.filter-values--lookback-input');
    assert.deepEqual(getSelectedOptions(), ['30 Days'], '30 is the only selected option after being clicked');
    await clickTrigger('.filter-values--lookback-input');
  });

  test('typing in a predefined lookback value', async function(assert) {
    assert.expect(2);

    this.set('onUpdateFilter', filter => {
      this.set('filter', { values: arr([filter.interval]) });
    });

    // type in 14
    await fillIn('.filter-values--lookback-input__value', 14);
    await blur('.filter-values--lookback-input__value');
    assert.dom('.filter-values--lookback-input__value').hasValue('14', 'typing in 14 updates the value');

    // Only 14 is selected
    await clickTrigger('.filter-values--lookback-input');
    assert.deepEqual(getSelectedOptions(), ['14 Days'], '14 is the only selected in the dropdown after being typed in');
    await clickTrigger('.filter-values--lookback-input');
  });

  test('typing in a not predefined lookback value', async function(assert) {
    assert.expect(4);

    this.set('onUpdateFilter', filter => {
      this.set('filter', { values: arr([filter.interval]) });
    });

    await clickTrigger('.filter-values--lookback-input');
    await click($('.navi-basic-dropdown-option:contains(7)')[0]);
    assert.dom('.filter-values--lookback-input__value').hasValue('7', 'Clicking last 7 days changes input value to 7');

    await clickTrigger('.filter-values--lookback-input');
    assert.deepEqual(getSelectedOptions(), ['7 Days'], '7 is the only selected option after being clicked');

    // type 22
    await fillIn('.filter-values--lookback-input__value', '22');
    await blur('.filter-values--lookback-input__value');

    const options = findAll('.navi-basic-dropdown-option');
    assert.equal(options.length, 8, 'There are 8 predefined values');
    assert.ok(
      options.every(el => el.getAttribute('aria-selected') === 'false'),
      'every option is not selected since 22 is not a preset'
    );
    await clickTrigger('.filter-values--lookback-input');
  });

  function getSelectedOptions() {
    return findAll('.navi-basic-dropdown-option')
      .filter(el => el.getAttribute('aria-selected') === 'true')
      .map(el => el.textContent.trim());
  }
});
