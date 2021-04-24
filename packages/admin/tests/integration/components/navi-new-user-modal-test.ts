import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { TestContext as Context } from 'ember-test-helpers';

interface TestContext extends Context {
  isUserModalOpen: boolean;
  toggleModal(): void;
  addUser(): void;
}

const TEMPLATE = hbs`
<NaviNewUserModal
  @isUserModalOpen={{this.isUserModalOpen}}
  @toggleModal={{this.toggleModal}}
  @addUser={{this.addUser}}
/>`;

module('Integration | Component | navi-new-user-modal', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: TestContext) {
    this.toggleModal = () => {
      this.isUserModalOpen = !this.isUserModalOpen;
    };
    this.addUser = () => undefined;
  });

  test('modal is open', async function (this: TestContext, assert) {
    assert.expect(1);

    this.isUserModalOpen = true;

    await render(TEMPLATE);

    assert.dom('.navi-new-user-modal__header-title').hasText('Create User', 'User modal is shown');
  });

  test('modal is closed', async function (assert) {
    assert.expect(1);

    this.isUserModalOpen = false;

    await render(TEMPLATE);

    assert.dom('.navi-new-user-modal__header-title').doesNotExist('User modal is not shown');
  });
});
