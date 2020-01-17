import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, fillIn, blur } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import { getDateRangeFormat } from './date-range-test';

module('Integration | Component | filter values/advanced interval input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('P4D', '2020-01-10')]) };
    this.request = { logicalTable: { timeGrain: { name: 'day' } } };
    this.onUpdateFilter = () => null;

    await render(hbs`<FilterValues::AdvancedIntervalInput
            @filter={{this.filter}}
            @request={{this.request}}
            @onUpdateFilter={{this.onUpdateFilter}}
            @isCollapsed={{this.isCollapsed}}
        />`);
  });

  test('it renders', function(assert) {
    assert.expect(3);

    assert.dom(findAll('.filter-values--advanced-interval-input__value')[0]).hasValue('P4D', 'Has lookback string');
    assert
      .dom(findAll('.filter-values--advanced-interval-input__value')[1])
      .hasValue('2020-01-09', 'Has exclusive end date');
    assert.dom('.filter-values--advanced-interval-input__label').hasText('Interval Help', 'Has interval help link');
  });

  test('changing values', async function(assert) {
    assert.expect(5);

    const originalRange = getDateRangeFormat(this);
    this.set('onUpdateFilter', ({ interval }) => {
      assert.equal(interval._start, 'P6D', 'The lookback is correct');
      assert.equal(interval._end.format('YYYY-MM-DD'), '2020-01-10', 'The end date is set inclusive');
      this.set('filter', { values: arr([interval]) });
    });

    const startElement = findAll('.filter-values--advanced-interval-input__value')[0];
    const endElement = findAll('.filter-values--advanced-interval-input__value')[1];
    await fillIn(startElement, 'P6D');
    await blur(startElement);
    const newRange = getDateRangeFormat(this);
    assert.notEqual(originalRange, newRange, 'The interval changed');
    assert.dom(startElement).hasValue('P6D', 'The start input value shows the correct lookback');
    assert.dom(endElement).hasValue('2020-01-09', 'The end input value shows the inclusive end date');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert
      .dom('.filter-values--advanced-interval-input')
      .doesNotExist('The since input does not display when collapsed');
    assert.dom().hasText(`${getDateRangeFormat(this)}`, 'The since input is rendered correctly when collapsed');
  });
});
