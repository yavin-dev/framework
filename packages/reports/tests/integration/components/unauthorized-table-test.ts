import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | unauthorized table', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<UnauthorizedTable />`);

    assert
      .dom('.navi-report-invalid__unauthorized')
      .includesText('Access Denied You do not have access to run this query.', 'Access denied messages is displayed');
  });
});
