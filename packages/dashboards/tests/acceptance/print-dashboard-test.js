import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | print dashboard', function(hooks) {
  setupApplicationTest(hooks);

  hooks.afterEach(function() {
    server.shutdown();
  });

  test('print dashboards index', async function(assert) {
    assert.expect(1);
    await visit('/print/dashboards/1');

    assert.equal(currentURL(), '/print/dashboards/1/view', 'Redirect to view sub route');
  });

  test('print dashboards view', async function(assert) {
    assert.expect(4);
    await visit('/print/dashboards/1/view');

    assert.notOk(find('.page-title').is(':visible'), 'Title should not be visible');

    assert.notOk(find('.editable-label__icon').is(':visible'), 'Title edit icon should not be visible');

    assert.notOk(find('.favorite-item').is(':visible'), 'Favirote icon should not be visible');

    assert.notOk(find('.dashboard-actions').is(':visible'), 'Dashboard actions should not be visible');
  });
});
