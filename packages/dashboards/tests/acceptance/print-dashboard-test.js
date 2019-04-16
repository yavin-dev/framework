import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | print dashboard', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('print dashboards index', async function(assert) {
    assert.expect(1);
    await visit('/print/dashboards/1');

    assert.equal(currentURL(), '/print/dashboards/1/view', 'Redirect to view sub route');
  });

  test('print dashboards view', async function(assert) {
    assert.expect(4);
    await visit('/print/dashboards/1/view');

    assert.dom('.page-title').isNotVisible('Title should not be visible');

    assert.dom('.editable-label__icon').isNotVisible('Title edit icon should not be visible');

    assert.dom('.favorite-item').isNotVisible('Favorite icon should not be visible');

    assert.dom('.dashboard-actions').isNotVisible('Dashboard actions should not be visible');
  });
});
