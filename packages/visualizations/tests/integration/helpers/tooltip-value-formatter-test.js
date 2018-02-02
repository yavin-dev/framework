import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tooltip-value-formatter', 'helper:tooltip-value-formatter', {
  integration: true
});

test('makes a call to smart-format-number by default', function(assert) {
  assert.expect(4);

  this.set('inputValue', '1234');
  this.set('metricName', 'testric');
  this.set('row', {});

  this.render(hbs`{{tooltip-value-formatter inputValue metricName row}}`);

  assert.equal(this.$().text().trim(),
    '1,234',
    'Formatted number is returned');

  this.set('inputValue', null);

  assert.equal(this.$().text().trim(),
    '',
    'null returns empty string');

  this.set('inputValue', undefined);

  assert.equal(this.$().text().trim(),
    '',
    'undefined returns empty string');

  this.set('inputValue', '');

  assert.equal(this.$().text().trim(),
    '',
    'empty string returns empty string');
});
