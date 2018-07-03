import { test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit, currentURL } from '@ember/test-helpers';
import moduleForAcceptance from './../helpers/module-for-acceptance';

// clickDropdown is defined by registerBasicDropdownHelpers in start-app.js
/* global clickDropdown */

moduleForAcceptance('Acceptance | dir new button', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /dir-new-button', async function(assert) {
    assert.expect(3)

    await visit('/');

    assert.equal(currentURL(), '/');

    await clickDropdown('.dir-new-button__trigger');

    await click('.dir-new-button__dropdown-option:contains(Dashboards)');

    assert.equal(currentURL(),
      '/dashboards/1/view',
      'Clicking the dashboards option creates a new dashboard and redirects there');

    await visit('/');

    await clickDropdown('.dir-new-button__trigger');

    await click('.dir-new-button__dropdown-option:contains(Reports)');

    //Creating a new report puts a unique temp id in the url so we have to use a regex to match the url
    const reportsURL = /\/reports\/[^/]*\/new/;
    assert.ok(reportsURL.match(currentURL()),
      'Clicking the reports option creates a new report and redirects there');
  });
});
