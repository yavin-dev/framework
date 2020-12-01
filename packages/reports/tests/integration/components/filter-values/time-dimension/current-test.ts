import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FragmentFactory from 'navi-core/services/fragment-factory';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import CurrentPeriod from 'navi-reports/components/filter-values/time-dimension/current';
import { getDateRangeFormat } from '../../../../helpers/get-date-range';

type ComponentArgs = CurrentPeriod['args'];
interface TestContext extends Context, ComponentArgs {}

const TEMPLATE = hbs`<FilterValues::TimeDimension::Current
  @filter={{this.filter}}
  @onUpdateFilter={{this.onUpdateFilter}}
  @isCollapsed={{this.isCollapsed}}
/>`;

module('Integration | Component | filter-values/time-dimension/current', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;

    this.filter = fragmentFactory.createFilter(
      'timeDimension',
      'bardOne',
      'network.dateTime',
      { grain: 'day' },
      'gte',
      ['current', 'next']
    ) as FilterFragment & { values: string[] };
    this.isCollapsed = false;
    this.onUpdateFilter = () => undefined;
  });

  test('it renders', async function(this: TestContext, assert) {
    assert.expect(2);

    await render(TEMPLATE);

    assert
      .dom('.filter-values--current-period')
      .hasText(`The current day. (${getDateRangeFormat(this.filter)})`, 'The current period is day');

    this.set('filter.parameters.grain', 'week');
    assert
      .dom('.filter-values--current-period')
      .hasText(`The current week. (${getDateRangeFormat(this.filter)})`, 'The current period changes to week');
  });

  test('collapsed', async function(this: TestContext, assert) {
    assert.expect(2);

    this.isCollapsed = true;

    await render(TEMPLATE);

    assert
      .dom('.filter-values--current-period')
      .doesNotExist('The current period label does not display when collapsed');
    assert
      .dom()
      .hasText(`${getDateRangeFormat(this.filter)}`, 'The current period is rendered correctly when collapsed');
  });
});
