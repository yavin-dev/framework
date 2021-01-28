import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import DateComponent from 'navi-reports/components/filter-values/time-dimension/date';

type ComponentArgs = DateComponent['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<FilterValues::TimeDimension::Date
  @filter={{this.filter}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;

module('Integration | Component | filter-values/time-dimension/date', function(hooks) {
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
      'gte',
      ['2020-01-01T00:00:00.000Z']
    ) as FilterFragment & { values: string[] };
    this.onUpdateFilter = () => null;
    this.isCollapsed = false;
  });

  test('Displayed text', async function(this: TestContext, assert) {
    await render(TEMPLATE);

    assert.dom('.filter-values--date-input input').hasValue('Jan 01, 2020', 'The selected date is displayed');

    this.set('filter', { values: [] });
    assert
      .dom('.filter-values--date-input input')
      .hasValue('', 'The placeholder text is displayed when no date is selected');
  });

  test('onUpdateFilter', async function(this: TestContext, assert) {
    assert.expect(1);

    await render(TEMPLATE);

    const selectedDate = '2020-01-09';

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(
        changeSet.values,
        [`${selectedDate}T00:00:00.000Z`],
        '`onUpdateFilter` correctly provided the new date value'
      );
    });
    await click('.dropdown-date-picker__trigger');
    await click(`[data-date="${selectedDate}"]`);
  });

  test('collapsed', async function(this: TestContext, assert) {
    this.isCollapsed = true;

    await render(TEMPLATE);

    assert.dom().hasText('Jan 01, 2020', 'Selected date is rendered correctly');

    this.set('filter', { values: [] });
    assert.dom('.filter-values--selected-error').exists('Error is rendered when date is invalid');
  });
});
