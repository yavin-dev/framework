import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { ReportUserArgs } from 'navi-reports/components/asset-owner';

module('Integration | Component | asset-owner', function (hooks) {
  setupRenderingTest(hooks);

  test('it describes updated user and updated time on reports header', async function (assert) {
    const arg: ReportUserArgs = { user: 'test-user', updatedOn: '2022-01-25T14:32:12' };
    this.set('user', arg.user);
    this.set('updatedOn', arg.updatedOn);
    await render(hbs`<AssetOwner @user={{this.user}} @updatedOn={{this.updatedOn}}/>`);
    assert
      .dom(this.element)
      .hasText(`test-user - Last Modified on Jan 25, 2022 2:32 PM`, 'it should show updated user and time');
  });
});
