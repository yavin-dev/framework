import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/addon/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import DateComponent from 'navi-reports/components/filter-values/date';

type ComponentArgs = DateComponent['args'];
interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | filter values/date', function(hooks) {
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
      ['2018-10-31']
    );
    this.onUpdateFilter = () => null;

    await render(hbs`
      <FilterValues::Date
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />`);
  });

  test('Displayed text', async function(this: TestContext, assert) {
    assert.dom('.filter-values--date').hasText('10/31/2018', 'The selected date is displayed');

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.set(
      'filter',
      fragmentFactory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'gte', [''])
    );
    assert
      .dom('.filter-values--date')
      .hasText('Select date', 'The placeholder text is displayed when no date is selected');
  });

  test('onUpdateFilter', async function(assert) {
    assert.expect(1);

    const selectedDate = '2018-10-09';

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: [selectedDate] }, '`onUpdateFilter` correctly provided the new date value');
    });
    await click('.filter-values--date-dimension-select__trigger');
    await click(`[data-date="${selectedDate}"]`);
  });

  test('collapsed', async function(assert) {
    this.set('isCollapsed', true);
    assert.dom().hasText('10/31/2018', 'Selected date is rendered correctly');

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.set(
      'filter',
      fragmentFactory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'gte', [''])
    );
    assert.dom('.filter-values--selected-error').exists('Error is rendered when date is invalid');
  });
});
