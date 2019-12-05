import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import $ from 'jquery';
import { render, fillIn, triggerEvent } from '@ember/test-helpers';
import { A as arr } from '@ember/array';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/value input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: arr([1000]) };
    this.onUpdateFilter = () => null;

    await render(hbs`{{filter-values/value-input
            filter=filter
            onUpdateFilter=(action onUpdateFilter)
            isCollapsed=isCollapsed
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert
      .dom('.filter-values--value-input')
      .hasValue(
        `${this.filter.values[0]}`,
        'The value select contains an input with the first filter value as the text'
      );
  });

  test('collapsed', function(assert) {
    assert.expect(2);

    this.set('isCollapsed', true);

    assert.dom('.filter-values--value-input').doesNotExist('The value input is not rendered when collapsed');
    assert.dom().hasText('1000', 'The value is rendered correctly when collapsed');
  });

  test('changing values', async function(assert) {
    assert.expect(1);

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { values: ['aaa'] }, 'User inputted number is given to update action');
    });

    await fillIn('.filter-values--value-input', 'aaa');
    await triggerEvent('.filter-values--value-input', 'keyup');
  });

  test('error state', function(assert) {
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
