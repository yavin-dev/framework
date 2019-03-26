import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import $ from 'jquery';
import { render, fillIn, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | filter values/multi value input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    this.filter = { values: [1000] };
    this.onUpdateFilter = () => null;

    await render(hbs`{{filter-values/multi-value-input
            filter=filter
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  });

  test('it renders', function(assert) {
    assert.expect(1);

    assert.equal(
      $('.emberTagInput-tag')[0].innerText.trim(),
      this.filter.values[0],
      'The value select contains an input with the first filter value as a tag'
    );
  });

  test('changing values', async function(assert) {
    assert.expect(3);

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: [1000, 'aaa'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', 'aaa');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: [1000, 'aaa', 'bbb'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', 'bbb');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: ['aaa', 'bbb'] }, 'Removing a tag updates the filter values');
    });

    await click($('.emberTagInput-tag:contains(1000)>.emberTagInput-remove')[0]);
  });

  test('error state', function(assert) {
    assert.expect(2);

    assert.notOk($('.filter-values--multi-value-input--error').is(':visible'), 'The input should not have error state');

    this.set('filter', { validations: { isInvalid: true } });
    assert.ok($('.filter-values--multi-value-input--error').is(':visible'), 'The input should have error state');
  });
});
