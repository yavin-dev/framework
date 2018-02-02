import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import $ from 'jquery';

moduleForComponent('lazy-render', 'Integration | Component | lazy render', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  this.render(hbs`
        {{#lazy-render target='body'}}
        lazy render
        {{/lazy-render}}
    `);

  assert.equal(this.$().text().trim(),
    '',
    'Nothing should be rendered initially');

  Ember.run(()=>{
    $('body').trigger('mouseenter');
  });

  assert.equal(this.$().text().trim(),
    'lazy render',
    'inner content is rendered after triggering event');
});
