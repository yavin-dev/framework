import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('loading-message', 'Integration | Component | loading message', {
  integration: true
});

test('it renders', function(assert) {
  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
        {{#loading-message}}
              Loading
        {{/loading-message}}
    `);

  assert.ok(this.$('.navi-loader'),
    'the navi-loader component is rendered');

  assert.equal(this.$('.loading-message').text().trim(),
    'Loading',
    'The text inside the block is rendered as specified');
});
