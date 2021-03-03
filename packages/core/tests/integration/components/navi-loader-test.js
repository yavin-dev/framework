import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi loader', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(3);

    await render(hbs`<NaviLoader class="test-container" />`);

    assert.dom('.navi-loader__container').exists('The loader container is rendered');

    assert.dom('.navi-loader__container.test-container').exists('The loader container is given the specified class');

    assert.dom('.loader').exists('The loader spinner is rendered');
  });
});
