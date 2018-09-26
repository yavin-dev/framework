import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filter-values/value-input', 'Integration | Component | filter values/value input', {
  integration: true,

  beforeEach: function() {
    this.filter = { values: [1000] };
    this.onUpdateFilter = () => null;

    this.render(hbs`{{filter-values/value-input
            filter=filter
            onUpdateFilter=(action onUpdateFilter)
        }}`);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  assert.equal(
    this.$('.filter-values--value-input').val(),
    this.filter.values[0],
    'The value select contains an input with the first filter value as the text'
  );
});

test('changing values', function(assert) {
  assert.expect(1);

  this.set('onUpdateFilter', changeSet => {
    assert.deepEqual(changeSet, { values: ['aaa'] }, 'User inputted number is given to update action');
  });

  this.$('.filter-values--value-input').val('aaa');
  this.$('.filter-values--value-input').trigger('keyup');
});

test('error state', function(assert) {
  assert.expect(2);

  assert.notOk(this.$('.filter-values--value-input--error').is(':visible'), 'The input should not have error state');

  this.set('filter', {
    validations: { attrs: { values: { isInvalid: true } } }
  });
  assert.ok(this.$('.filter-values--value-input--error').is(':visible'), 'The input should have error state');
});
