import { click, visit, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { teardownModal } from '../helpers/teardown-modal';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | share link', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return visit('/reports');
  });

  hooks.afterEach(function() {
    teardownModal();
    server.shutdown();
  });

  test('report share link', async function(assert) {
    let baseUrl = document.location.origin;

    await triggerEvent('.navi-collection__row0', 'mouseover');
    await click('.navi-collection__row0 .share .btn');

    assert
      .dom('.modal-input-box')
      .hasValue(`${baseUrl}/reports/1`, 'The share link is built correctly by buildReportUrl');
  });
});
