import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import { TestContext as Context } from 'ember-test-helpers';
import { A as arr } from '@ember/array';
import { get } from '@ember/object';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import hbs from 'htmlbars-inline-precompile';
import FragmentFactory from 'navi-core/addon/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import DimensionDateRange from 'navi-reports/components/filter-values/dimension-date-range';

type ComponentArgs = DimensionDateRange['args'];
interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | filter values/dimension date range', function(hooks) {
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
    );

    await render(hbs`
      <FilterValues::DimensionDateRange
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />`);
  });

  test('displayed dates and update actions', async function(this: TestContext, assert) {
    assert.expect(6);

    this.set('onUpdateFilter', () => null);
    assert.equal(
      find('.filter-values--dimension-date-range-input')
        ?.textContent?.replace(/\s\s+/g, ' ')
        .trim(),
      'Since and Before',
      'Appropriate placeholders are displayed when the filter has no dates'
    );

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.set(
      'filter',
      fragmentFactory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', [
        '2019-01-05',
        ''
      ])
    );

    //Check that setting low value sends the new date value to the action
    this.set('onUpdateFilter', (filter: Partial<FilterFragment>) => {
      assert.deepEqual(get(filter, 'values'), ['2019-01-12', ''], 'Selecting the low date updates the filter');
    });
    await click('.filter-values--dimension-date-range-input__low-value > .dropdown-date-picker__trigger');
    await click('.ember-power-calendar-day[data-date="2019-01-12"]');

    //Set a high value so that the calendar opens to January 2019 instead of the month that this test is run
    this.set(
      'filter',
      fragmentFactory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', [
        '2019-01-05',
        '2019-01-12'
      ])
    );

    //Check that setting high value sends the new date value to the action
    this.set('onUpdateFilter', (filter: Partial<FilterFragment>) => {
      assert.deepEqual(
        get(filter, 'values'),
        ['2019-01-05', '2019-01-15'],
        'Selecting the high date updates the filter'
      );
    });
    await click('.filter-values--dimension-date-range-input__high-value>.dropdown-date-picker__trigger');
    await click('.ember-power-calendar-day[data-date="2019-01-15"]');

    //Check that dates are displayed correctly
    this.set(
      'filter',
      fragmentFactory.createFilter('timeDimension', 'bardOne', 'network.dateTime', { grain: 'day' }, 'bet', [
        '2019-01-12',
        '2019-01-15'
      ])
    );
    assert.equal(
      find('.filter-values--dimension-date-range-input')
        ?.textContent?.replace(/\s\s+/g, ' ')
        .trim(),
      '01/12/2019 and 01/15/2019',
      'Appropriate dates are displayed when the filter has dates'
    );

    this.set('isCollapsed', true);
    assert.dom().hasText('01/12/2019 and 01/15/2019', 'Selected range is rendered correctly when collapsed');

    this.set('filter', { values: [] });

    assert
      .dom('.filter-values--dimension-date-range-input .filter-values--selected-error')
      .exists('Error is rendered when collapsed and range is invalid');
  });
});
