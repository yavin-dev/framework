import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { ReportUserArgs } from 'navi-reports/components/asset-owner';

module('Integration | Component | asset-owner', function (hooks) {
  setupRenderingTest(hooks);

  test('it describes updated user and updated time on reports header', async function (assert) {
    const now = new Date();
    const arg: ReportUserArgs = { user: 'test-user', updatedOn: now.toISOString().split('.')[0] };
    this.set('user', arg.user);
    this.set('updatedOn', arg.updatedOn);
    await render(hbs`<AssetOwner @user={{this.user}} @updatedOn={{this.updatedOn}}/>`);
    assert
      .dom(this.element)
      .hasText(
        `${arg.user} - Last Modified on ${moment(arg.updatedOn).format('lll')}`,
        'it should show updated user and time'
      );
  });
});
