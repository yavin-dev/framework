import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('scrollbar-wrapper', 'Integration | Component | scrollbar wrapper', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{scrollbar-wrapper}}`);

  assert.equal(
    this.$()
      .text()
      .trim(),
    ''
  );

  this.render(hbs`
    {{#scrollbar-wrapper}}
      template block text
    {{/scrollbar-wrapper}}
  `);

  assert.equal(
    this.$()
      .text()
      .trim(),
    'template block text'
  );
});
