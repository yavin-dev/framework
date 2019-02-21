import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

module('Integration | Component | lazy render', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);

    await render(hbs`
          {{#lazy-render target='body'}}
          lazy render
          {{/lazy-render}}
      `);

    assert.dom('*').hasText('', 'Nothing should be rendered initially');

    run(() => {
      $('body').trigger('mouseenter');
    });

    assert.dom('*').hasText('lazy render', 'inner content is rendered after triggering event');
  });
});
