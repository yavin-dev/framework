import { click, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { teardownModal } from '../helpers/teardown-modal';

module('Acceptance | share link', function(hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    teardownModal();
    server.shutdown();
  });

  test('dashboard share link', async function(assert) {
    assert.expect(1);

    await visit('/dashboards');
    let baseUrl = document.location.origin;

    await click('.navi-collection__row:first-of-type .share .btn');

    assert.equal(
      find('.modal-input-box')[0].value,
      `${baseUrl}/dashboards/1`,
      'The share link is built correctly by buildDashboardUrl'
    );
  });
});
