import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { click, fillIn, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support/helpers';
import FragmentFactory from 'navi-core/services/fragment-factory';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import Lookback from 'navi-reports/components/filter-values/time-dimension/lookback';
import { getDateRangeFormat } from '../../../../helpers/get-date-range';

type ComponentArgs = Lookback['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<FilterValues::TimeDimension::Lookback
  @filter={{this.filter}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;

module('Integration | Component | filter-values/time-dimension/lookback', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;

    this.filter = fragmentFactory.createFilter(
      'timeDimension',
      'bardOne',
      'network.dateTime',
      { grain: 'day' },
      'gte',
      ['P4D', 'current']
    ) as FilterFragment & { values: string[] };
    this.isCollapsed = false;

    this.onUpdateFilter = ({ values }) => {
      if (values) {
        this.filter.values = values;
      }
    };
  });

  test('it renders', async function (this: TestContext, assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert
      .dom('.filter-values--lookback-input')
      .hasText(`days (${getDateRangeFormat(this.filter)})`, 'The dateTimePeriod and concrete interval are displayed');
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('4', 'The input value is the number of days to look back');
  });

  test('changing values', async function (this: TestContext, assert) {
    assert.expect(3);

    await render(TEMPLATE);

    const originalRange = getDateRangeFormat(this.filter);
    await fillIn('.filter-values--lookback-input__value', '5');
    await triggerEvent('.filter-values--lookback-input__value', 'keyup');
    const newRange = getDateRangeFormat(this.filter);
    assert.notEqual(originalRange, newRange, 'The interval changed');
    assert
      .dom('.filter-values--lookback-input')
      .hasText(`days (${newRange})`, 'The dateTimePeriod and concrete interval are displayed');
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('5', 'The input value changed along with the interval');
  });

  test('collapsed', async function (this: TestContext, assert) {
    this.isCollapsed = true;

    await render(TEMPLATE);

    assert.dom('.filter-values--lookback-input').doesNotExist('The lookback input does not display when collapsed');
    assert
      .dom()
      .hasText(`4 days (${getDateRangeFormat(this.filter)})`, 'The lookback is rendered correctly when collapsed');
  });

  test('selecting preset values', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    // Set to 7
    await selectChoose('.filter-values--lookback-trigger', '7');
    assert.dom('.filter-values--lookback-input__value').hasValue('7', 'Clicking last 7 days changes input value to 7');

    // Only 7 is selected
    await click('.filter-values--lookback-trigger');
    assert
      .dom('.ember-power-select-option[aria-selected="true"]')
      .hasText('7 Days', '7 Days is the only selected option after being clicked');
    await click('.filter-values--lookback-input');

    // Set to 30
    await selectChoose('.filter-values--lookback-trigger', '30');
    assert
      .dom('.filter-values--lookback-input__value')
      .hasValue('30', 'Clicking last 30 days changes input value to 30');

    // Only 30 is selected
    await click('.filter-values--lookback-trigger');
    assert
      .dom('.ember-power-select-option[aria-selected="true"]')
      .hasText('30 Days', '30  days is the only selected option after being clicked');
    await click('.filter-values--lookback-trigger');
  });

  test('typing in a predefined lookback value', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    // type in 14
    await fillIn('.filter-values--lookback-input__value', '14');
    assert.dom('.filter-values--lookback-input__value').hasValue('14', 'typing in 14 updates the value');

    // Only 14 is selected
    await click('.filter-values--lookback-trigger');
    assert
      .dom('.ember-power-select-option[aria-selected="true"]')
      .hasText('14 Days', '14 is the only selected in the dropdown after being typed in');
    await click('.filter-values--lookback-trigger');
  });

  test('typing in a not predefined lookback value', async function (this: TestContext, assert) {
    await render(TEMPLATE);

    await selectChoose('.filter-values--lookback-trigger', '7 Days');
    assert.dom('.filter-values--lookback-input__value').hasValue('7', 'Clicking last 7 days changes input value to 7');

    await click('.filter-values--lookback-trigger');
    assert
      .dom('.ember-power-select-option[aria-selected="true"]')
      .hasText('7 Days', '7 is the only selected option after being clicked');

    // type 22
    await fillIn('.filter-values--lookback-input__value', '22');

    const options = findAll('.ember-power-select-option');
    assert.equal(options.length, 8, 'There are 8 predefined values');
    assert
      .dom('.ember-power-select-option[aria-selected="true"]')
      .doesNotExist('There is no selected option because 22 is not a preset');
    await click('.filter-values--lookback-input');
  });
});
