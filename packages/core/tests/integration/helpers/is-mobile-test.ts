import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | is-mobile', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async (assert) => {
    await render(hbs`{{is-mobile}}`);
    assert.dom().hasText(/^true|false$/, '`is-mobile` returns a boolean');
  });
});
