import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi-info-message', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <NaviInfoMessage
        @icon="ember"
        @iconClass="my-icon-class"
        @title="My Message"
        class="my-class"
      >
        <span class="my-content">Inner Content</span>
      </NaviInfoMessage>
    `);

    assert.dom('.navi-info-message.my-class').exists('it renders with custom classes');
    assert.dom('.d-icon.d-ember.my-icon-class').exists('it renders given icon with custom classes');
    assert.dom('.navi-info-message__title').hasText('My Message', 'it renders given title');
    assert.dom('.my-content').hasText('Inner Content', 'it yields');
    assert.dom('.navi-info-message__tech-details').doesNotExist('without named block tech details are not rendered');
  });

  test('technical details', async function (assert) {
    await render(hbs`
      <NaviInfoMessage
        @hideTechDetails={{this.hideTechDetails}}
      >
        <:tech-details>
          Inner Tech Details
        </:tech-details>
      </NaviInfoMessage>
    `);

    assert.dom('.navi-info-message__tech-details-content').hasText('Inner Tech Details', 'tech details when provided');
    assert.dom('.navi-info-message__tech-details-toggle').isNotVisible('by default toggle tech details is not visible');
    assert
      .dom('.navi-info-message details')
      .hasAttribute('open', '', 'by default tech details when given are displayed');

    this.set('hideTechDetails', true);

    assert.dom('.navi-info-message__tech-details-toggle').isVisible('toggle tech details is visible when requested');
    assert
      .dom('.navi-info-message details')
      .doesNotHaveAttribute('open', 'tech details when given are hidden when requested');
  });
});
