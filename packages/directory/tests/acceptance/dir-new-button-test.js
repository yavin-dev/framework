import { findAll, click, currentURL, visit } from '@ember/test-helpers';
import { module, skip } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | dir new button', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  skip('transitions on clicking new button', async function(assert) {
    assert.expect(1);

    await visit('/directory/my-data');
    await click('.dir-new-button__trigger');
    let dashboardLink = findAll('.dir-new-button__dropdown-option').find(
      option => option.textContent.trim() === 'Dashboards'
    );
    await click(dashboardLink);

    //Creating a new dashboards creates a new id in the url so we have to use a regex to match the url
    const dashboardsURL = /\/dashboards\/[^/]*\/view/;
    assert.ok(
      dashboardsURL.test(currentURL()),
      'Clicking the dashboards option creates a new dashboard and redirects there'
    );

    await visit('/directory/my-data');
    await click('.dir-new-button__trigger');
    let reportLink = findAll('.dir-new-button__dropdown-option').find(
      option => option.textContent.trim() === 'Reports'
    );
    await click(reportLink);

    //Creating a new report puts a unique temp id in the url so we have to use a regex to match the url
    const reportsURL = /\/reports\/[^/]*\/new/;
    assert.ok(reportsURL.test(currentURL()), 'Clicking the reports option creates a new report and redirects there');
  });
});
