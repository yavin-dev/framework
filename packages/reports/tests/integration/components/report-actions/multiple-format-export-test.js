import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import $ from 'jquery';
import hbs from 'htmlbars-inline-precompile';
import config from 'ember-get-config';

const TEMPLATE = hbs`
    <ReportActions::MultipleFormatExport
      @report={{this.report}}
      @disabled={{this.disabled}}
      @naviNotifications={{this.mockNotifications}}
      @startDownload={{this.startDownload}}
    >
      Export
    </ReportActions::MultipleFormatExport>
    `;

let Store;

module('Integration | Component | report actions - multiple-format-export', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    Store = this.owner.lookup('service:store');

    // Mock notifications
    this.mockNotifications = {
      add: () => null,
      clear: () => null,
    };

    // Mock download
    this.startDownload = () => null;

    const report = await Store.findRecord('report', 1);
    this.set('report', report);
  });

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(TEMPLATE);
    assert.dom('.menu-trigger').hasText('Export', 'Component yields content as expected');
  });

  test('export download links', async function (assert) {
    assert.expect(3);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];

    const factService = this.owner.lookup('service:navi-facts');
    const compressionService = this.owner.lookup('service:compression');

    await render(TEMPLATE);

    // CSV
    const expectedHref = factService.getURL(this.report.request.serialize(), { format: 'csv' });
    this.set('startDownload', (href) => assert.equal(href, expectedHref, 'CSV link is correct'));
    await click($('.menu-content a:contains("CSV")')[0]);

    // PDF
    let exportHref;
    this.set('startDownload', async (href) => (exportHref = await href));
    await render(TEMPLATE);
    await click($('.menu-content a:contains("PDF")')[0]);

    const encodedModel = exportHref.split('/export?reportModel=')[1];

    const actualModel = (await compressionService.decompressModel(encodedModel)).serialize();
    const expectedModel = this.report.serialize();

    //strip off owner
    delete expectedModel.data.relationships;

    assert.deepEqual(actualModel, expectedModel, 'PDF link is correct');

    // PNG
    const expectedPngHref = `${exportHref}&fileType=png`;
    await click($('.menu-content a:contains("PNG")')[0]);
    assert.equal(exportHref, expectedPngHref, 'PNG link has appropriate link to export service');

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('filename', async function (assert) {
    assert.expect(1);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv'];

    this.set('startDownload', async (href, filename) =>
      assert.equal(filename, 'hyrule-news', 'The download attribute is set to the dasherized report name')
    );

    await render(TEMPLATE);
    await click($('.menu-content a:contains("CSV")')[0]);
    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('disabled dropdown', async function (assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);

    assert.dom('.menu-content').doesNotExist('Dropdown content should not exist');
  });

  test('notifications - valid report', async function (assert) {
    assert.expect(2);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv'];

    this.mockNotifications.add = ({ title }) => assert.step(title);

    await render(TEMPLATE);
    await click($('.menu-content a:contains("CSV")')[0]);

    assert.verifySteps(
      ['The CSV download should begin shortly'],
      'A single notification is added for the clicked export type'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('GSheet Notification', async function (assert) {
    assert.expect(2);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['gsheet'];

    let addCalls = 0;
    this.mockNotifications.add = ({ title }) => {
      addCalls++;
      if (addCalls === 1) {
        assert.equal(
          title,
          'We are building your spreadsheet and sending it to Google Drive. Keep an eye out for the email!',
          'A notification is added for the clicked export type'
        );
      } else {
        assert.equal(
          title,
          'Your export is done and available at https://google.com/sheets/foo',
          'Second notification after ajax call comes back'
        );
      }
    };

    await render(TEMPLATE);
    await click($('.menu-content a:contains("Google Sheet")')[0]);

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('notifications - invalid report', async function (assert) {
    assert.expect(3);

    const originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv'];

    const report = await Store.findRecord('report', 2);
    this.set('report', report);

    this.mockNotifications.add = ({ title }) => assert.step(title);

    await render(TEMPLATE);
    await click($('.menu-content a:contains("CSV")')[0]);

    assert.verifySteps(
      ['The CSV download should begin shortly', 'Your export has failed. Please run a valid report and try again.'],
      'An error notification is added for an invalid report'
    );

    config.navi.FEATURES.exportFileTypes = originalFlag;
  });
});
