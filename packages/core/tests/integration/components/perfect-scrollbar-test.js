import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('perfect-scrollbar', 'Integration | Component | perfect scrollbar', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#perfect-scrollbar}}
      template block text
    {{/perfect-scrollbar}}
  `);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'template block text'
  );

  assert.equal(this.$('.ps').length, 1, 'perfect scrollbar is rendered');
});
