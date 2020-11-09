import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';
import FilterFragment from 'navi-core/models/bard-request-v2/fragments/filter';
import FragmentFactory from 'navi-core/addon/services/fragment-factory';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
import RangeInput from 'navi-reports/components/filter-values/range-input';

type ComponentArgs = RangeInput['args'];
interface TestContext extends Context, ComponentArgs {}
module('Integration | Component | filter values/range input', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function(this: TestContext) {
    await this.owner.lookup('service:navi-metadata').loadMetadata();

    const fragmentFactory = this.owner.lookup('service:fragment-factory') as FragmentFactory;
    this.filter = fragmentFactory.createFilter('metric', 'bardOne', 'adClicks', {}, 'bet', [1000, 2000]);
    this.onUpdateFilter = () => null;

    await render(hbs`
      <FilterValues::RangeInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @isCollapsed={{this.isCollapsed}}
      />`);
  });

  test('it renders', function(assert) {
    assert.expect(1);
    assert.deepEqual(
      findAll('.filter-values--range-input__input')
        .map((el: HTMLInputElement) => el.value?.trim())
        .filter(val => !!val)
        .map(val => parseInt(val, 10)),
      [1000, 2000],
      'The value selects contain inputs with the filter values as the text'
    );
  });

  test('collapsed', function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--range-input__input').doesNotExist('The range inputs are not rendered when collapsed');
    assert.dom().hasText('1000 and 2000', 'Selected values are rendered correctly when collapsed');
  });

  test('changing values', async function(assert) {
    assert.expect(2);

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: ['aaa', 2000] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--range-input__input:first-child', 'aaa');

    this.set('onUpdateFilter', (changeSet: Partial<FilterFragment>) => {
      assert.deepEqual(changeSet, { values: [1000, 'bbb'] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--range-input__input:last-child', 'bbb');
  });

  test('error state', function(assert) {
    assert.expect(3);
    assert.notOk(
      $('.filter-values--range-input__input--error').is(':visible'),
      'The input should not have error state'
    );

    this.set('filter', {
      validations: { attrs: { values: { isInvalid: true } } }
    });
    assert.ok($('.filter-values--range-input__input--error').is(':visible'), 'The input should have error state');

    this.set('isCollapsed', true);
    assert.dom('.filter-values--selected-error').exists('Error is rendered correctly when collapsed');
  });
});
