import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, find, visit, waitFor } from '@ember/test-helpers';
import { linkContains } from 'navi-core/test-support/contains-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';
import backstop from 'ember-backstop/test-support/backstop';

module('Acceptance | custom reports', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Viewing saved reports', async function(assert) {
    await visit('/reports');
    assert.dom('.navi-reports-index .navi-collection table').exists();
    await backstop(assert, { name: 'REPORT LIST VIEW' });

    let firstReport = '.navi-collection tbody td:first-child a',
      reportTitle = find(firstReport).textContent.trim();

    await click(firstReport);
    assert.ok(
      currentURL().match(/^\/reports\/\d+\/view$/),
      `On clicking the "${reportTitle}" link, user is brought to the appropriate report view`
    );

    assert.dom('.navi-report__title').hasText(reportTitle, `Report title contains text "${reportTitle}" as expected`);

    //wait for animation
    await waitFor('.chart-series-0[style="opacity: 1; pointer-events: none;"]');

    await backstop(assert, { name: 'LOAD LINE CHART REPORT' });
  });

  test('Accessing Report Builder', async function(assert) {
    await visit('/reports');
    await click(linkContains('New Report'));
    assert.ok(
      currentURL().match(
        /^\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/edit/
      ),
      'Clicking "New Report" button brings the user to the report builder'
    );

    assert.dom('.report-builder').exists();
    await backstop(assert, { name: 'NEW REPORT' });
  });

  test('Run report with a filter', async function(assert) {
    await visit('/reports/new');

    // Add filter
    await clickItemFilter('dimension', 'Character');
    await click('.filter-values--dimension-select__trigger', 'Luigi');
    await backstop(assert, { name: 'REPORT DIMENSION FILTER MENU' });
    await selectChoose('.filter-values--dimension-select__trigger', 'Luigi');
    assert.dom('.filter-builder-dimension__values').containsText('Luigi', 'A filter value can be selected');

    // Run Report
    await click('.navi-report__run-btn');
    assert.dom('.table-widget').exists('Data visualization is shown');
    await backstop(assert, { name: 'TABLE REPORT WITH FILTER' });
  });
});
