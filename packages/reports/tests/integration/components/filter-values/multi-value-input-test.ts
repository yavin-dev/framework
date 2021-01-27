import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, triggerEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import MultiValueInput from 'navi-reports/components/filter-values/multi-value-input';

type ComponentArgs = MultiValueInput['args'];
interface TestContext extends Context, ComponentArgs {}

module('Integration | Component | filter values/multi value input', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter('dimension', 'bardOne', 'age', { field: 'id' }, 'in', ['10']);
    this.onUpdateFilter = () => null;

    await render(hbs`
      <FilterValues::MultiValueInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />
    `);
  });

  test('it renders', function(this: TestContext, assert) {
    assert
      .dom('.tag')
      .hasText(
        this.filter.values[0].toString(),
        'The value select contains an input with the first filter value as a tag'
      );
  });

  test('collapsed', function(this: TestContext, assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.emberTagInput').doesNotExist('The tag input is not rendered when collapsed');
    assert.dom().hasText('10', 'Selected values are rendered correctly when collapsed');
  });

  test('changing values', async function(this: TestContext, assert) {
    assert.expect(3);
    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['10', '11'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', '11');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['10', '11', '12'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', '12');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['11', '12'] }, 'Removing a tag updates the filter values');
    });

    await click('.tag__remove');
  });

  test('error state', function(this: TestContext, assert) {
    assert.expect(3);

    assert.dom('filter-values--multi-value-input--error').isNotVisible('The input should not have error state');

    this.set('filter', { validations: { isInvalid: true } });
    assert.dom('.filter-values--multi-value-input--error').isVisible('The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });
});
