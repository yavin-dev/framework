import { click, visit, triggerEvent } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | share link', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    return visit('/reports');
  });

  test('report share link', async function(assert) {
    let baseUrl = document.location.origin;

    await triggerEvent('.navi-collection__row0', 'mouseenter');
    await click('.navi-collection__row0 .share .btn');

    assert.dom('.share-input').hasValue(`${baseUrl}/reports/1`, 'The share link is built correctly by buildReportUrl');
  });
});
