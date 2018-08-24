import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('visualization-config/<%= dasherizedModuleName %>', 'Integration | Component | visualization config/<%= dasherizedModuleName %>', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{visualization-config/<%= dasherizedModuleName %>}}`);

  assert.equal(this.$('.<%= dasherizedModuleName %>-config').text().trim(),
    'No configuration options available.',
    'Component has no configuration options');
});
