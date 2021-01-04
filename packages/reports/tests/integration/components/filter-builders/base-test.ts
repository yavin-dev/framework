import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
// @ts-ignore
import { clickTrigger, nativeMouseUp } from 'ember-power-select/test-support/helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
// @ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import $ from 'jquery';
import FragmentFactory from 'navi-core/services/fragment-factory';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';

interface TestContext extends Context {
  filter: FilterFragment;
}

module('Integration | Component | filter-builders/base', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const factory: FragmentFactory = this.owner.lookup('service:fragment-factory');
    this.set('filter', factory.createFilter('dimension', 'bardOne', 'age', {}, 'in', [1, 2, 3]));
    await this.owner.lookup('service:navi-metadata').loadMetadata();
  });

  test('it renders', async function(this: TestContext, assert) {
    await render(hbs`
    <FilterBuilders::Test
      @filter={{this.filter}}
    />`);

    assert
      .dom('.filter-builder__subject')
      .hasText(this.filter.displayName, "Subject's name is display in filter builder");
    assert
      .dom('.filter-builder__operator .ember-power-select-selected-item')
      .hasText('Equals', 'The filter current operator is selected by default');

    assert.dom('.test-filter-value-one').isVisible('The component specified by the filter operator is rendered');

    await clickTrigger();
    assert.deepEqual(
      findAll('.ember-power-select-option').map(el => el.textContent?.trim()),
      ['Equals', 'Not Equals', 'Is Empty'],
      'All supported operators show up as options in the operator selector'
    );
  });

  test('collapsed', async function(this: TestContext, assert) {
    this.set('isCollapsed', true);
    await render(hbs`
    <FilterBuilders::Test
      @filter={{this.filter}}
      @isCollapsed={{this.isCollapsed}}
    />`);

    assert
      .dom('.filter-builder')
      .hasText(`${this.filter.displayName} equals Test Filter Value One`, 'Rendered correctly when collapsed');
  });

  test('changing operator', async function(assert) {
    assert.expect(2);

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(
        changeSet,
        {
          operator: 'notin'
        },
        'Values is not reset when changing between operator with the same valuesComponent'
      );
    });

    await render(hbs`
    <FilterBuilders::Test
      @filter={{this.filter}}
      @onUpdateFilter={{this.onUpdateFilter}}
    />`);

    /* == Operator with same valuesComponent == */
    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Not Equals)')[0]);

    /* == Operator with different valuesComponent == */
    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet.values, [true], 'Values is set to default value when changing between operators');
    });
    await clickTrigger();
    await nativeMouseUp($('.ember-power-select-option:contains(Is Empty)')[0]);
  });
});
