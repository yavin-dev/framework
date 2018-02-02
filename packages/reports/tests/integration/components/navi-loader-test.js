import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('navi-loader', 'Integration | Component | navi loader', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);

  this.render(hbs`{{navi-loader
        containerClass='test-container'
    }}`);

  assert.ok(this.$('.navi-loader__container').is(':visible'),
    'The loader container is rendered');

  assert.ok(this.$('.navi-loader__container.test-container').is(':visible'),
    'The loader container is given the specified class');

  assert.ok(this.$('.navi-loader__spinner').is(':visible'),
    'The loader spinner is rendered');

  assert.equal(this.$('.navi-loader__bounce').length,
    3,
    'Three loader bounce elements are rendered');
});
