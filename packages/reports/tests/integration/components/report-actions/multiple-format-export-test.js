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
      @title={{this.title}}
      @disabled={{this.disabled}}
      @naviNotifications={{this.mockNotifications}}
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

    await this.owner.lookup('service:navi-metadata').loadMetadata();
    const report = await Store.findRecord('report', 1);
    this.set('report', report);
  });

  test('export links', async function (assert) {
    assert.expect(4);

    config.navi.FEATURES.exportFileTypes = ['csv', 'pdf', 'png'];
    const factService = this.owner.lookup('service:navi-facts');
    const compressionService = this.owner.lookup('service:compression');

    await render(TEMPLATE);

    assert.dom('.menu-trigger').hasText('Export', 'Component yields content as expected');

    // CSV
    let expectedHref = factService.getURL(this.report.get('request').serialize(), { format: 'csv' });
    assert.equal(
      $('.menu-content a:contains("CSV")').attr('href'),
      expectedHref,
      'CSV link has appropriate link to API'
    );

    const exportHref = $('.menu-content a:contains("PDF")').attr('href');
    const encodedModel = exportHref.split('/export?reportModel=')[1];

    const actualModel = (await compressionService.decompressModel(encodedModel)).serialize();
    const expectedModel = this.report.serialize();

    //strip off owner
    delete expectedModel.data.relationships;

    assert.deepEqual(actualModel, expectedModel, 'PDF link has appropriate link to export service');

    const pngHref = $('.menu-content a:contains("PNG")').attr('href');
    assert.equal(`${exportHref}&fileType=png`, pngHref, 'PNG link has appropriate link to export service');
    config.navi.FEATURES.exportFileTypes = [];
  });

  test('filename', async function (assert) {
    assert.expect(1);

    let originalFlag = config.navi.FEATURES.exportFileTypes;
    config.navi.FEATURES.exportFileTypes = ['csv'];
    await render(TEMPLATE);

    assert.equal(
      $('.menu-content a:contains("CSV")').attr('download'),
      'hyrule-news',
      'The download attribute is set to the dasherized report name'
    );
    config.navi.FEATURES.exportFileTypes = originalFlag;
  });

  test('disabled dropdown', async function (assert) {
    assert.expect(1);

    this.set('disabled', true);
    await render(TEMPLATE);

    assert.dom('.menu-content').doesNotExist('Dropdown content should not exist');
  });

  test('notifications', async function (assert) {
    assert.expect(1);

    this.mockNotifications.add = ({ title }) => {
      assert.equal(
        title,
        'The CSV download should begin shortly',
        'A notification is added for the clicked export type'
      );
    };

    this.set('exportFormats', [
      {
        type: 'CSV',
        href: null,
        icon: 'file-text-o',
      },
    ]);
    await render(hbs`
      <ReportActions::MultipleFormatExport
        @report={{this.report}}
        @disabled={{this.disabled}}
        @naviNotifications={{this.mockNotifications}}
        @exportFormats={{this.exportFormats}}
      >
        Export
      </ReportActions::MultipleFormatExport>
    `);

    await click($('.menu-content a:contains("CSV")')[0]);
  });

  test('GSheet Notification', async function (assert) {
    assert.expect(2);

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
          'Your export is done and available at <a href="https://google.com/sheets/foo" target="_blank" rel="noopener noreferrer">here &raquo;</a>',
          'Second notification after ajax call comes back'
        );
      }
    };

    this.set('exportFormats', [
      {
        type: 'Google Sheet',
        href: '/gsheet-export/report/1',
        icon: 'google',
        async: true,
      },
    ]);
    await render(hbs`
      <ReportActions::MultipleFormatExport
        @report={{this.report}}
        @disabled={{this.disabled}}
        @naviNotifications={{this.mockNotifications}}
        @exportFormats={{this.exportFormats}}
      >
        Export
      </ReportActions::MultipleFormatExport>
    `);

    await click($('.menu-content a:contains("Google Sheet")')[0]);
  });
});
