import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
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
      this.$('.emberTagInput-tag')[0].innerText.trim(),
      this.filter.values[0],
      'The value select contains an input with the first filter value as a tag'
    );
  });

  test('changing values', async function(assert) {
    assert.expect(3);

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: ['aaa'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', 'aaa');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: ['aaa', 'bbb'] }, 'User inputted values are given to update action');
    });

    await fillIn('.emberTagInput-new>input', 'bbb');
    await triggerEvent('.js-ember-tag-input-new', 'blur');

    this.set('onUpdateFilter', changeSet => {
      assert.deepEqual(changeSet, { rawValues: ['bbb'] }, 'Removing a tag updates the filter values');
    });

    this.$('.emberTagInput-tag:contains(1000)>.emberTagInput-remove').click();
  });

  test('error state', function(assert) {
    assert.expect(2);

    assert.notOk(
      this.$('.filter-values--multi-value-input--error').is(':visible'),
      'The input should not have error state'
    );

    this.set('filter', { validations: { isInvalid: true } });
    assert.ok(this.$('.filter-values--multi-value-input--error').is(':visible'), 'The input should have error state');
  });
});
