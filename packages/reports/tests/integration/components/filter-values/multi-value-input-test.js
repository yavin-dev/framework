import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filter-values/multi-value-input', 'Integration | Component | filter values/multi value input', {
  integration: true,

  beforeEach: function() {
    this.filter = { values: [1000] };
    this.onUpdateFilter = () => null;

    this.render(hbs`{{filter-values/multi-value-input
            filter=filter
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  assert.equal(this.$('.emberTagInput-tag')[0].innerText.trim(),
    this.filter.values[0],
    'The value select contains an input with the first filter value as a tag');
});

test('changing values', function(assert) {
  assert.expect(3);

  this.set('onUpdateFilter', (changeSet) => {
    assert.deepEqual(changeSet,
      { rawValues: ['aaa'] },
      'User inputted values are given to update action');
  });

  this.$('.emberTagInput-new>input').val('aaa');
  this.$('.js-ember-tag-input-new').trigger('blur');

  this.set('onUpdateFilter', (changeSet) => {
    assert.deepEqual(changeSet,
      { rawValues: ['aaa', 'bbb'] },
      'User inputted values are given to update action');
  });

  this.$('.emberTagInput-new>input').val('bbb');
  this.$('.js-ember-tag-input-new').trigger('blur');

  this.set('onUpdateFilter', (changeSet) => {
    assert.deepEqual(changeSet,
      { rawValues: ['bbb'] },
      'Removing a tag updates the filter values');
  });

  this.$('.emberTagInput-tag:contains(1000)>.emberTagInput-remove').click();
});

test('error state', function(assert) {
  assert.expect(2);

  assert.notOk(this.$('.filter-values--multi-value-input--error').is(':visible'),
    'The input should not have error state');

  this.set('filter', { validations: { isInvalid: true } });
  assert.ok(this.$('.filter-values--multi-value-input--error').is(':visible'),
    'The input should have error state');
});
