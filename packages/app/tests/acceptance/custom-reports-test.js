import { click, currentURL, find, visit } from '@ember/test-helpers';
import { isPresent } from '@ember/utils';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | custom reports', function(hooks) {
  setupApplicationTest(hooks);

  test('Viewing saved reports', async function(assert) {
    assert.expect(3);

    await visit('/reports');
    assert.ok(
      isPresent(find('.navi-reports-index .navi-collection table')),
      'Table containing list of custom reports is visible'
    );

    let firstReport = '.navi-collection tbody td:first a',
      reportTitle = find(firstReport).textContent.trim();

    await click(firstReport);
    assert.ok(
      currentURL().match(/^\/reports\/\d+\/view$/),
      `On clicking the "${reportTitle}" link, user is brought to the appropriate report view`
    );

    assert.dom('.navi-report__title').hasText(reportTitle, `Report title contains text "${reportTitle}" as expected`);
  });

  test('Accessing Report Builder', async function(assert) {
    assert.expect(2);

    await visit('/reports');
    await click('a:contains("New Report")');
    assert.ok(
      currentURL().match(
        /^\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/edit/
      ),
      'Clicking "New Report" button brings the user to the report builder'
    );

    assert.ok(isPresent(find('.report-builder')), 'Custom report builder is visible');
  });
});
