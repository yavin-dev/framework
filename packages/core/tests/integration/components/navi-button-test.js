import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | navi-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <NaviButton
        class="custom-class"
        title="I am a title"
      >
        Click Me
      </NaviButton>
    `);
    assert.dom('.navi-button').hasText('Click Me', 'button yields');
    assert.dom('.navi-button').hasClass('custom-class', 'button passes custom class');
    assert.dom('.navi-button').hasAttribute('title', 'I am a title', 'button spreads attributes');
  });

  test('type', async function (assert) {
    await render(hbs`
      <NaviButton
        @type={{type}}
      >
        Click Me
      </NaviButton>
    `);
    assert.dom('.navi-button').hasClass('navi-button--primary', 'button create correct class for default type');

    this.set('type', 'primary');
    assert.dom('.navi-button').hasClass('navi-button--primary', 'button creates correct class for primary type');

    this.set('type', 'secondary');
    assert.dom('.navi-button').hasClass('navi-button--secondary', 'button creates correct class for secondary type');
  });

  test('disabled', async function (assert) {
    this.set('type', 'primary');
    this.set('disabled', false);

    await render(hbs`
      <NaviButton
        @type={{type}}
        @disabled={{disabled}}
      >
        Click Me
      </NaviButton>
    `);
    assert.dom('.navi-button').hasClass('navi-button--primary', 'button is not disabled by default');

    this.set('disabled', true);
    assert.dom('.navi-button').hasClass('navi-button--primary-disabled', 'button has correct class when disabled');

    this.set('type', 'secondary');
    assert.dom('.navi-button').hasClass('navi-button--secondary-disabled', 'button has correct class when disabled');
  });

  test('onClick', async function (assert) {
    assert.expect(1);

    this.set('onClick', () => assert.ok('onClick fired'));
    await render(hbs`
      <NaviButton
        @type="primary"
        @disabled={{disabled}}
        @onClick={{action onClick}}
      >
        Click Me
      </NaviButton>
    `);
    await click('.navi-button');

    this.set('disabled', true);
    this.set('onClick', () => assert.notOk('onClick should not fire when disabled'));
    await click('.navi-button');
  });
});
