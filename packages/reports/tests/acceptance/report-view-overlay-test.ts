import { click, visit } from '@ember/test-helpers';
//@ts-ignore
import { setupMirage } from 'ember-cli-mirage/test-support';
//@ts-ignore
import { selectChoose } from 'ember-power-select/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
//@ts-ignore
import { setupAnimationTest } from 'ember-animated/test-support';
//@ts-ignore
import { clickItem } from 'navi-reports/test-support/report-builder';

const overlaySelector = '.report-view-overlay--visible';
function assertOverlayNotVisible(assert: Assert, message = 'The report view overlay is not visible') {
  assert.dom(overlaySelector).doesNotExist(message);
}

function assertOverlayVisible(assert: Assert, message = 'The report view overlay is visible') {
  assert.dom(overlaySelector).exists(message);
}

function assertReportNeedsRun(assert: Assert, message = 'The response is not up to date with the request') {
  assert.dom('.report-view__info-text').containsText('Run request', message);
}

function assertReportDoesNotNeedRun(assert: Assert, message = 'The response is up to date with the request') {
  assert.dom('.report-view__info-text').doesNotExist(message);
}

const clickOverlayRun = () => click(`${overlaySelector} .report-view-overlay__button--run`);
const clickOverlayDismiss = () => click(`${overlaySelector} .report-view-overlay__button--dismiss`);
const clickRevertReport = () => click('.navi-report__revert-btn');

module('Acceptance | report-view-overlay', function(hooks) {
  setupApplicationTest(hooks);
  setupAnimationTest(hooks);
  setupMirage(hooks);

  test('load existing report', async function(assert) {
    assert.expect(1);

    await visit('/reports/1/view');
    assertOverlayNotVisible(assert);
  });

  test('revert test', async function(assert) {
    assert.expect(2);

    await visit('/reports/1/view');
    await click('[aria-label="delete metric Nav Link Clicks"]');
    assertOverlayVisible(assert, 'The overlay is visible when a column has been removed');
    await clickRevertReport();
    assertOverlayNotVisible(assert);
  });

  test('duplicate column', async function(assert) {
    assert.expect(4);

    await visit('/reports/1/view');
    await clickItem('metric', 'Nav Link Clicks', undefined);
    assertOverlayNotVisible(assert, 'The overlay is not visible when a duplicate column is added');
    await click('[aria-label="delete metric Nav Link Clicks"]');
    assertOverlayNotVisible(assert, 'The overlay is not visible when a duplicate column is removed');
    await clickItem('metric', 'Revenue', undefined);
    assertOverlayVisible(assert, 'The overlay is visible when a new column is added');
    await clickRevertReport();
    assertOverlayNotVisible(assert);
  });

  test('new column', async function(assert) {
    assert.expect(5);

    await visit('/reports/1/view');
    await clickItem('metric', 'Revenue', undefined);
    assertOverlayVisible(assert, 'The overlay is visible when a new column is added');
    await clickOverlayDismiss();
    assertOverlayNotVisible(assert, 'The overlay is not visible after being dismissed');
    assertReportNeedsRun(assert, 'Dismissing the overlay does not update the report');
    await clickItem('dimension', 'Age', undefined);
    assertOverlayNotVisible(assert, 'The overlay is not visible when new updates are made');
    assertReportNeedsRun(assert, 'The report still needs to be run');
  });

  test('change parameter', async function(assert) {
    assert.expect(3);

    await visit('/reports/1/view');
    await click('.navi-column-config-item[data-name="property(field=id)"] .navi-column-config-item__trigger');
    await selectChoose('.navi-column-config-item__parameter-trigger', 'desc');
    assertOverlayVisible(assert, 'The overlay is visible when a parameter is changed');
    await clickOverlayRun();
    assertOverlayNotVisible(assert, 'The overlay is not visible when the request has been run');
    assertReportDoesNotNeedRun(assert);
  });
});
