import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('navi-icon', 'Integration | Component | navi icon', {
  integration: true
});

test('render icon', function(assert) {
  assert.expect(2);

  this.render(hbs`
      {{navi-icon
          class= 'test-icon'
          type='credit-card'
      }}
  `);

  assert.ok(this.$('.fa-credit-card'),
    'An fa icon element is rendered with the `fa-credit-card` class');

  assert.ok(this.$('.fa-credit-card.test-icon'),
    'An fa icon element with the given class name is rendered');
});
