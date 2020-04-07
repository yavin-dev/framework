import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, fillIn, blur } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import Interval from 'navi-core/utils/classes/interval';
import { getDateRangeFormat } from './date-range-test';

const TEMPLATE = hbs`
<FilterValues::AdvancedIntervalInput
  @filter={{this.filter}}
  @request={{this.request}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;
module('Integration | Component | filter values/advanced interval input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([Interval.parseFromStrings('P4D', '2020-01-09')]) };
    this.request = { logicalTable: { timeGrain: 'day', table: { timeGrainIds: ['all', 'day', 'week', 'month'] } } };
    this.onUpdateFilter = () => null;
  });

  test('it renders', async function(assert) {
    assert.expect(3);
    await render(TEMPLATE);

    assert.dom(findAll('.filter-values--advanced-interval-input__value')[0]).hasValue('P4D', 'Has lookback string');
    assert
      .dom(findAll('.filter-values--advanced-interval-input__value')[1])
      .hasValue('2020-01-09', 'Has exclusive end date');
    assert.dom('.filter-values--advanced-interval-input__label').hasText('Interval Help', 'Has interval help link');
  });

  test('changing start value', async function(assert) {
    assert.expect(5);
    await render(TEMPLATE);

    const originalRange = getDateRangeFormat(this);
    this.set('onUpdateFilter', ({ interval }) => {
      assert.equal(interval._start, 'P6D', 'The lookback is correct');
      assert.equal(interval._end.format('YYYY-MM-DD'), '2020-01-09', 'The end date is not modified');
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

  test('changing end value all grain', async function(assert) {
    assert.expect(6);
    this.set('request.logicalTable.timeGrain', 'all');
    await render(TEMPLATE);

    this.set('onUpdateFilter', ({ interval }) => {
      assert.equal(interval._start, 'P4D', 'The lookback is correct');
      assert.equal(interval._end.format('YYYY-MM-DD'), '2020-01-09', 'The end date is set exactly as typed in');
      this.set('filter', { values: arr([interval]) });
    });

    const startElement = findAll('.filter-values--advanced-interval-input__value')[0];
    const endElement = findAll('.filter-values--advanced-interval-input__value')[1];
    assert.dom(startElement).hasValue('P4D', 'The start input value shows the correct lookback');
    assert.dom(endElement).hasValue('2020-01-09', 'The end input value shows the inclusive end date');
    await fillIn(endElement, '2020-01-09');
    await blur(endElement);
    assert.dom(startElement).hasValue('P4D', 'The start input value shows the correct lookback');
    assert.dom(endElement).hasValue('2020-01-09', 'The end input value shows the inclusive end date');
  });

  test('collapsed', async function(assert) {
    assert.expect(2);
    await render(TEMPLATE);

    this.set('isCollapsed', true);

    assert
      .dom('.filter-values--advanced-interval-input')
      .doesNotExist('The since input does not display when collapsed');
    assert.dom().hasText(`${getDateRangeFormat(this)}`, 'The since input is rendered correctly when collapsed');
  });
});
