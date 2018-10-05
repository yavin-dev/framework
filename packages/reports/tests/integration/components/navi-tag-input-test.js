import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Component from '@ember/component';

const DIVINE_BEASTS = ['Ruta', 'Medoh', 'Neboris', 'Rudania'];

moduleForComponent('navi-tag-input', 'Integration | Component | navi tag input/tag', {
  integration: true
});

test('default tag component', function(assert) {
  assert.expect(2);

  this.set('tags', DIVINE_BEASTS);

  this.set('removeTagAtIndex', index => {
    assert.equal(index, 2, 'Clicking remove icon on calls removeTagAtIndex with the clicked tag index');
  });

  this.render(hbs`
    {{#navi-tag-input
      tags=tags
      removeTagAtIndex=(action removeTagAtIndex)
      as |divineBeast|
    }}
      {{divineBeast}}
    {{/navi-tag-input}}
  `);

  assert.deepEqual(
    this.$('.emberTagInput-tag')
      .toArray()
      .map(e => e.textContent.trim()),
    DIVINE_BEASTS,
    'Default tag component provides ember tag input class and yields'
  );

  // Test tag removal
  this.$('.emberTagInput-remove:eq(2)').click();
});

test('custom tag component', function(assert) {
  assert.expect(2);

  this.register(
    'component:my-wacky-tag',
    Component.extend({
      classNames: 'my-wacky-tag'
    })
  );

  this.set('tags', DIVINE_BEASTS);

  this.render(hbs`
    {{#navi-tag-input
      tags=tags
      tagComponent='my-wacky-tag'
      as |divineBeast|
    }}
      {{divineBeast}}
    {{/navi-tag-input}}
  `);

  assert.deepEqual(
    this.$('.my-wacky-tag')
      .toArray()
      .map(e => e.textContent.trim()),
    DIVINE_BEASTS,
    'Custom tag component can be given to add new behavior'
  );

  assert.equal(
    this.$('.emberTagInput-remove').length,
    0,
    'Elements from the default component are not required in a custom tag'
  );
});
