import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';

module('Integration | Component | navi-new-user-modal', function (hooks) {
  setupRenderingTest(hooks);

  test('modal is open', async function (assert) {
    assert.expect(1);

    // @ts-ignore
    set(this, 'isUserModalOpen', true);
    // @ts-ignore
    set(this, 'toggleModal', () => {
      // @ts-ignore
      this.isUserModalOpen = !this.isUserModalOpen;
    });
    // @ts-ignore
    set(this, 'addUser', () => {});

    await render(
      hbs`<NaviNewUserModal @isUserModalOpen={{this.isUserModalOpen}} @toggleModal={{this.toggleModal}} @addUser={{this.addUser}} />`
    );

    assert.dom('.navi-new-user-modal__header-title').hasText('Create User', 'User modal is shown');
  });

  test('modal is closed', async function (assert) {
    assert.expect(1);

    // @ts-ignore
    set(this, 'isUserModalOpen', false);
    // @ts-ignore
    set(this, 'toggleModal', () => {
      // @ts-ignore
      this.isUserModalOpen = !this.isUserModalOpen;
    });
    // @ts-ignore
    set(this, 'addUser', () => {});

    await render(
      hbs`<NaviNewUserModal @isUserModalOpen={{this.isUserModalOpen}} @toggleModal={{this.toggleModal}} @addUser={{this.addUser}} />`
    );

    assert.dom('.navi-new-user-modal__header-title').doesNotExist('User modal is not shown');
  });
});
