import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerEvent } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import { getDateRangeFormat } from './date-range-test';

module('Integration | Component | filter values/lookback input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('P4D', 'current')]) };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
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
});
