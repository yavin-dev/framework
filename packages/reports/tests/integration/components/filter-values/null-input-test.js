import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('filter-values/null-input', 'Integration | Component | filter values/null input', {
  integration: true
});

test('changing values', function(assert) {
  assert.expect(1);

  this.onUpdateFilter = changeSet => {
    assert.deepEqual(changeSet.values, ['""'], 'When rendering the component, "" is set as the filter value');
  };

  this.render(hbs`{{filter-values/null-input onUpdateFilter=(action onUpdateFilter)}}`);

  // Assert handled in action
});
