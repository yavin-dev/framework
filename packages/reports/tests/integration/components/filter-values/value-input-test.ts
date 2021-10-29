import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/request/filter';
import FragmentFactory from 'navi-core/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import ValueInput from 'navi-reports/components/filter-values/value-input';

type ComponentArgs = ValueInput['args'];
interface TestContext extends Context, ComponentArgs {}
module('Integration | Component | filter values/value input', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function (this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter('metric', 'bardOne', 'adClicks', {}, 'gt', [1000]);
    this.onUpdateFilter = () => null;

    await render(hbs`
      <FilterValues::ValueInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />`);
  });

  test('it renders', function (this: TestContext, assert) {
    assert.expect(1);

    assert
      .dom('.filter-values--value-input')
      .hasValue(
        `${this.filter.values[0]}`,
        'The value select contains an input with the first filter value as the text'
      );
  });

  test('collapsed', function (this: TestContext, assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--value-input').doesNotExist('The value input is not rendered when collapsed');
    assert.dom().hasText('1000', 'The value is rendered correctly when collapsed');
  });

  test('changing values', async function (this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['aaa'] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--value-input', 'aaa');
  });

  test('error state', function (this: TestContext, assert) {
    assert.dom('.input').doesNotHaveClass('is-error', 'The input should not have error state');

    this.set('filter', {
      validations: { attrs: { values: { isInvalid: true } } },
    });

    assert.dom('.input').hasClass('is-error', 'The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });
});
