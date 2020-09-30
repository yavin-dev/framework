import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import $ from 'jquery';
import { render, fillIn } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/addon/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';

interface TestContext extends Context {
  filter: FilterFragment;
  onUpdateFilter(changeSet: Partial<FilterFragment>): void;
  isCollapsed: boolean;
}
module('Integration | Component | filter values/value input', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter('metric', 'bardOne', 'adClicks', {}, 'bet', [1000]);
    this.onUpdateFilter = () => null;

    await render(hbs`
      <FilterValues::ValueInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />`);
  });

  test('it renders', function(this: TestContext, assert) {
    assert.expect(1);

    assert
      .dom('.filter-values--value-input')
      .hasValue(
        `${this.filter.values[0]}`,
        'The value select contains an input with the first filter value as the text'
      );
  });

  test('collapsed', function(this: TestContext, assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--value-input').doesNotExist('The value input is not rendered when collapsed');
    assert.dom().hasText('1000', 'The value is rendered correctly when collapsed');
  });

  test('changing values', async function(this: TestContext, assert) {
    assert.expect(1);

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['aaa'] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--value-input', 'aaa');
  });

  test('error state', function(this: TestContext, assert) {
    assert.expect(3);

    assert.notOk($('.filter-values--value-input--error').is(':visible'), 'The input should not have error state');

    this.set('filter', {
      validations: { attrs: { values: { isInvalid: true } } }
    });
    assert.ok($('.filter-values--value-input--error').is(':visible'), 'The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });
});
