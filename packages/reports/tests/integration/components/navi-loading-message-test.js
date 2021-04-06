import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TEMPLATE = hbs`
<NaviLoadingMessage>
  Loading
</NaviLoadingMessage>
`;

module('Integration | Component | navi loading message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(TEMPLATE);

    assert.dom('.loader').exists('the loader component is rendered');

    assert.dom('.navi-loading-message').hasText('Loading', 'The text inside the block is rendered as specified');
  });
});
