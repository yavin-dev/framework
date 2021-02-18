import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi icon', function (hooks) {
  setupRenderingTest(hooks);

  test('render icon', async function (assert) {
    assert.expect(2);

    await render(hbs`
      <NaviIcon class='test-icon' @icon='credit-card'/>
    `);

    assert.dom('.fa-credit-card').exists('An fa icon element is rendered with the `fa-credit-card` class');

    assert.dom('.fa-credit-card.test-icon').exists('An fa icon element with the given class name is rendered');
  });
});
