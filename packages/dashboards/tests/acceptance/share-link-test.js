import { click, triggerEvent, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | share link', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('dashboard share link', async function(assert) {
    assert.expect(1);

    await visit('/dashboards');
    let baseUrl = document.location.origin;

    await triggerEvent('.navi-collection__row0', 'mouseenter');

    await click('.navi-collection__row0 .share .btn');

    assert
      .dom('.modal-input-box')
      .hasValue(`${baseUrl}/dashboards/1`, 'The share link is built correctly by buildDashboardUrl');
  });
});
