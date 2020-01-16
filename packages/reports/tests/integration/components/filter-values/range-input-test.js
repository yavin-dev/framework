import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import $ from 'jquery';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/range input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: A([1000, 2000]) };
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
      $('.filter-values--range-input__input')
        .map((index, el) => parseInt($(el).val(), 10))
        .get(),
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

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { values: ['aaa', 2000] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--range-input__input:first-child', 'aaa');

    this.set('onUpdateFilter', changeSet => {
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

  test('config placeholders', async function(assert) {
    assert.expect(1);
    await render(hbs`
      <FilterValues::RangeInput
        @filter={{this.filter}}
        @onUpdateFilter={{this.onUpdateFilter}}
        @lowPlaceholder="start"
        @highPlaceholder="end"
      />`);

    assert.deepEqual(
      $('.filter-values--range-input__input')
        .map((index, el) => $(el).attr('placeholder'))
        .get(),
      ['start', 'end'],
      'The inputs have correct text as the placeholders'
    );
  });
});
