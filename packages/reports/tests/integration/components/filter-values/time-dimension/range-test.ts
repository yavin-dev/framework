import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import hbs from 'htmlbars-inline-precompile';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import DimensionDateRange from 'navi-reports/components/filter-values/time-dimension/range';

type ComponentArgs = DimensionDateRange['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<FilterValues::TimeDimension::Range
  @filter={{this.filter}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;

module('Integration | Component | filter-values/time-dimension/range', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter(
      'timeDimension',
      'bardOne',
      'network.dateTime',
      { grain: 'day' },
      'bet',
      []
    ) as FilterFragment & { values: string[] };
  });

  test('it renders', async function(this: TestContext, assert) {
    assert.expect(4);

    await render(TEMPLATE);

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Start', 'Placeholder text is present when no date range is selected');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('End', 'Placeholder text is present when no date range is selected');

    this.set('filter', { values: ['2019-11-29', '2019-12-06'] });

    assert
      .dom('.filter-values--date-range-input__low-value')
      .hasText('Nov 29, 2019', 'Placeholder text is inclusive start date');

    assert
      .dom('.filter-values--date-range-input__high-value')
      .hasText('Dec 05, 2019', 'Placeholder text is inclusive end date');
  });

  test('changing values', async function(this: TestContext, assert) {
    assert.expect(2);

    const end = '2019-12-06';
    this.filter.values = ['2019-11-29', end];
    await render(TEMPLATE);

    // Click start date
    await click('.filter-values--date-range-input__low-value > .dropdown-date-picker__trigger');
    const newStartStr = '2019-11-28';

    this.set('onUpdateFilter', ({ values }: Partial<FilterFragment>) => {
      assert.deepEqual(values, [`${newStartStr}T00:00:00.000Z`, end], 'Updating start date works only updates start');
    });

    await click(`.ember-power-calendar-day[data-date="${newStartStr}"]`);

    this.set('filter.values', [`${newStartStr}T00:00:00.000Z`, end]);

    // Click end date
    await click('.filter-values--date-range-input__high-value > .dropdown-date-picker__trigger');
    const newEndStr = '2019-12-07';

    this.set('onUpdateFilter', ({ values }: Partial<FilterFragment>) => {
      assert.deepEqual(
        values,
        [`${newStartStr}T00:00:00.000Z`, '2019-12-08T00:00:00.000Z'],
        'Updating inclusive end date adds extra day'
      );
    });

    await click(`.ember-power-calendar-day[data-date="${newEndStr}"]`);
  });

  test('collapsed', async function(this: TestContext, assert) {
    assert.expect(2);

    this.filter.values = ['2020-01-03', '2020-01-10'];
    this.isCollapsed = true;

    await render(TEMPLATE);

    assert.dom().hasText('Jan 03, 2020 - Jan 09, 2020', 'Selected range text is rendered correctly');

    this.set('filter', { values: [] });

    assert.dom('.filter-values--selected-error').exists('Error is rendered when range is invalid');
  });
});
