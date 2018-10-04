import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('scrollbar-wrapper', 'Integration | Component | scrollbar wrapper', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{scrollbar-wrapper}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#scrollbar-wrapper}}
      template block text
    {{/scrollbar-wrapper}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
