import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi loader', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);

    await render(hbs`{{navi-loader
          containerClass='test-container'
      }}`);

    assert.ok(this.$('.navi-loader__container').is(':visible'), 'The loader container is rendered');

    assert.ok(
      this.$('.navi-loader__container.test-container').is(':visible'),
      'The loader container is given the specified class'
    );

    assert.ok(this.$('.navi-loader__spinner').is(':visible'), 'The loader spinner is rendered');

    assert.dom('.navi-loader__bounce').exists({ count: 3 }, 'Three loader bounce elements are rendered');
  });
});
