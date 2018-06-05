import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('format-table-cell', 'helper:format-table-cell', {
  integration: true
});

test('empty value', function(assert) {
  assert.expect(1);

  this.render(hbs`{{format-table-cell}}`);
  assert.equal(this.$().text().trim(),
    '--',
    'empty value should be rendered as "--"');
});

test('format value', function (assert) {
  assert.expect(1);

  this.render(hbs`{{format-table-cell 2.3 '$0,0[.]00'}}`);
  assert.equal(this.$().text().trim(),
    '$2.30',
    'format value should be rendered correctly');
});