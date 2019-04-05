import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | loading message', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
          {{#loading-message}}
                Loading
          {{/loading-message}}
      `);

    assert.ok(this.$('.navi-loader'), 'the navi-loader component is rendered');

    assert.dom('.loading-message').hasText('Loading', 'The text inside the block is rendered as specified');
  });
});
