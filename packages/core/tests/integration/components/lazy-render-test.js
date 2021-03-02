import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | lazy render', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);

    await render(hbs`<LazyRender @target="body">lazy render</LazyRender>`);

    assert.dom().hasText('', 'Nothing should be rendered initially');

    await triggerEvent(document.body, 'mouseenter');

    assert.dom().hasText('lazy render', 'inner content is rendered after triggering event');
  });
});
