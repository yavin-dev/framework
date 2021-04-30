import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, find, visit } from '@ember/test-helpers';
import { linkContains } from 'navi-core/test-support/contains-helpers';
import { selectChoose } from 'ember-power-select/test-support';
import { clickItemFilter } from 'navi-reports/test-support/report-builder';

module('Acceptance | custom reports', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('Viewing saved reports', async function (assert) {
    assert.expect(3);

    await visit('/reports');
    assert.dom('.navi-reports-index .navi-collection table').exists();

    let firstReport = '.navi-collection tbody td:first-child a',
      reportTitle = find(firstReport).textContent.trim();

    await click(firstReport);
    assert.ok(
      currentURL().match(/^\/reports\/\d+\/view$/),
      `On clicking the "${reportTitle}" link, user is brought to the appropriate report view`
    );

    assert
      .dom('.report-header__title')
      .hasText(
        reportTitle,
        `Report title contains text "${reportTitle}" as expected`
      );
  });

  test('Accessing Report Builder', async function (assert) {
    assert.expect(2);

    await visit('/reports');
    await click(linkContains('New Report'));
    assert.ok(
      currentURL().match(
        /^\/reports\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/edit/
      ),
      'Clicking "New Report" button brings the user to the report builder'
    );

    assert.dom('.report-builder').exists();
  });

  test('Run report with a filter', async function (assert) {
    await visit('/reports/new');

    // Add filter
    await clickItemFilter('dimension', 'Character');
    await selectChoose('.filter-values--dimension-select__trigger', '1');
    assert
      .dom('.filter-values--dimension-select__trigger')
      .containsText('1', 'A filter value can be selected');
  });
});
