import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi loading message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
          {{#navi-loading-message}}
                Loading
          {{/navi-loading-message}}
      `);

    assert.ok($('.navi-loader'), 'the navi-loader component is rendered');

    assert.dom('.navi-loading-message').hasText('Loading', 'The text inside the block is rendered as specified');
  });
});
