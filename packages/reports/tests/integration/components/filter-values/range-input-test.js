import { A } from '@ember/array';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/range input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: A([1000, 2000]) };
    this.onUpdateFilter = () => null;

    await render(hbs`{{filter-values/range-input
            filter=filter
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert.deepEqual(
      this.$('.filter-values--range-input__input')
        .map((index, el) => parseInt($(el).val(), 10))
        .get(),
      [1000, 2000],
      'The value selects contain inputs with the filter values as the text'
    );
  });

  test('changing values', function(assert) {
    assert.expect(2);

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { values: ['aaa', 2000] }, 'User inputted number is given to update action');
    });

    this.$('.filter-values--range-input__input')
      .eq(0)
      .val('aaa');
    this.$('.filter-values--range-input__input')
      .eq(0)
      .trigger('keyup');

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { values: [1000, 'bbb'] }, 'User inputted number is given to update action');
    });

    this.$('.filter-values--range-input__input')
      .eq(1)
      .val('bbb');
    this.$('.filter-values--range-input__input')
      .eq(1)
      .trigger('keyup');
  });

  test('error state', function(assert) {
    assert.expect(2);
    assert.notOk(
      this.$('.filter-values--range-input__input--error').is(':visible'),
      'The input should not have error state'
    );

    this.set('filter', {
      validations: { attrs: { values: { isInvalid: true } } }
    });
    assert.ok(this.$('.filter-values--range-input__input--error').is(':visible'), 'The input should have error state');
  });

  test('config placeholders', async function(assert) {
    assert.expect(1);
    await render(hbs`{{filter-values/range-input
          filter=filter
          onUpdateFilter=(action onUpdateFilter)
          lowPlaceholder='start'
          highPlaceholder='end'
      }}`);

    assert.deepEqual(
      this.$('.filter-values--range-input__input')
        .map((index, el) => $(el).attr('placeholder'))
        .get(),
      ['start', 'end'],
      'The inputs have correct text as the placeholders'
    );
  });
});
